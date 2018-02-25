#!/usr/bin/env node

const fs = require('fs')
const util = require('util')

const debug = require('debug')
const cheerio = require('cheerio')
const program = require('commander')
const PO = require('pofile')

const cheerioOptions = {
  decodeEntities: false
}

program
  .version('1.0.0')
  .usage('<dir>')
  .option('-f, --file <file>', 'Translations file [default: translations.po]')
  .parse(process.argv)

if (typeof program.args[0] === 'undefined') {
  console.error('No directory given.')
  process.exit(1)
}

run(program.args[0], program.file || 'translations.po')
  .then(res => console.log(res))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

async function run (dir, translations) {
  const l = debug('run')
  const po = await util.promisify(PO.load)(translations)

  console.log(po.items)

  const fileToItems = po.items.reduce((fileToItems, item) => {
    const replace = item.msgid
    const find = item.comments[0]
    const file = item.references[0]

    fileToItems[file] = fileToItems[file] || []
    fileToItems[file].push({
      find,
      replace,
      translation: item.msgstr[0] || item.msgid
    })

    return fileToItems
  }, {})

  const readFile = util.promisify(fs.readFile)
  const writeFile = util.promisify(fs.writeFile)

  await Promise.all(Object.keys(fileToItems).map(async (fileName) => {
    const replacements = fileToItems[fileName]
    l(`Processing ${fileName}`)
    // open file
    const content = await readFile(fileName, 'utf8')
    let lines = content.split('\n')

    // process replacements
    replacements.forEach(({ find, replace, translation }) => {
      // special cases
      if (find.startsWith('<') && find.endsWith('>') && find[1] !== '!') {
        const selector = find.substr(1, find.length - 2)
        l(`Processing selector: ${selector}`)
        const $ = cheerio.load(lines.join('\n'), cheerioOptions)
        $(selector).html(translation)
        // recreate lines
        lines = $.html().split('\n')
        return
      }

      // find occurrence
      const found = lines.findIndex(line => line.indexOf(find) !== -1)
      if (found === -1) {
        console.warn(`Not found: ${find} in ${fileName})`)
        return
      }

      lines[found] = lines[found].replace(replace, translation)
    })

    l(`Writing ${fileName}`)
    await writeFile(fileName, lines.join('\n'), 'utf8')
  }))
}
