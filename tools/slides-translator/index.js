#!/usr/bin/env node

const cheerio = require('cheerio')
const debug = require('debug')
const fs = require('fs')
const path = require('path')
const util = require('util')

const gettextParser = require('gettext-parser')
const program = require('commander')

const cheerioOptions = {
  decodeEntities: false
}

program
  .version('1.0.0')
  .usage('<dir>')
  .option('-o, --output <file>', 'Output file [default: translations.po]')
  .parse(process.argv)

if (typeof program.args[0] === 'undefined') {
  console.error('No directory given.')
  process.exit(1)
}

run(program.args[0])
  .then(res => console.log(res))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })

async function run (directory) {
  const l = debug('run')
  l(`reading ${directory}`)
  const dir = path.resolve(directory)

  l(`resolved ${dir}`)

  const files = await discoverFiles(dir)

  const unique = Array.from(new Set(files))

  l('found files', unique)

  const results = await Promise.all(unique.map(async (file) => {
    return {
      name: file,
      texts: await findTranslatableTexts(file)
    }
  }))

  l('Results: ', results)

  const fileName = program.file || 'translations.po'

  const existing = await getExistingTranslations(fileName)

  const po = {
    charset: "utf-8",
    comments: [
      `Translations for: ${dir}`,
      `Generated at: ${new Date().toString()}`
    ],
    translations: {
      '': {}
    }
  }

  results.forEach(file => {
    file.texts.map(text => {
      po.translations[''][text.id] = {
        msgid: text.id,
        msgstr: existing(file.name, text.id),
        comments: {
          translator: text.match,
          reference: file.name
        }
      }
    })
  })

  l('saving translations')
  const cmp = gettextParser.po.compile(po)
  await util.promisify(fs.writeFile)(fileName, cmp)

  const trans = po.translations['']
  Object.keys(trans)
    .filter(key => trans[key].msgstr.length !== 0)
    .forEach(key => delete trans[key])
  l('saving new translations')
  const cmp2 = gettextParser.po.compile(po)
  await util.promisify(fs.writeFile)(`${fileName}.new`, cmp2)
}

async function getExistingTranslations (fileName) {
  if (!fs.existsSync(fileName)) {
    debug('run')(`Existing file not found: ${fileName}`)
    return () => []
  }

  const con = await util.promisify(fs.readFile)(fileName)
  const po = gettextParser.po.parse(con)
  const existing = {}
  Object.values(po.translations['']).forEach(item => {
    const file = item.comments && item.comments.reference
    const id = item.msgid
    const translation = item.msgstr[0]

    if (translation) {
      existing[file] = existing[file] || {}
      existing[file][id] = translation
    }
  })

  debug('run')('Existing translations', existing)

  return (file, id) => {
    const f = existing[file]
    if (!f) {
      return []
    }

    if (!f[id]) {
      return []
    }

    return [f[id]]
  }
}

async function discoverFiles (dir) {
  const files = await util.promisify(fs.readdir)(dir)
  const toFullPath = (file) => path.join(dir, file)

  const otherFiles = await Promise.all(files
    // get only html files
    .map(toFullPath)
    .map(convertToIndexHtml)
    .filter(onlyHtml)
    .map(readHtmlFile)
  )

  return otherFiles.reduce(concat, [])
}

function convertToIndexHtml (file) {
  const withHtml = path.join(file, 'index.html')
  if ((file.endsWith('/') || file.indexOf('.') === -1) && fs.existsSync(withHtml)) {
    return withHtml
  }

  return file
}

function onlyHtml (file) {
  return file.endsWith('.html')
}

function concat (a, b) {
  return a.concat(b)
}

async function readHtmlFile (file) {
  const log = debug('readHtml')
  log(`reading ${file}`)
  if (!file.endsWith('.html')) {
    file = path.join(file, 'index.html')
  }

  const dir = path.dirname(file)
  const content = await util.promisify(fs.readFile)(file, 'utf8')
  const $ = cheerio.load(content, cheerioOptions)
  const getAttr = (name) => (idx, e) => $(e).attr(name)
  const notExternal = (url) => !url.startsWith('http')
  const toFullPath = (file) => path.join(dir, file)

  // links (for instance in index.html / agenda)
  const links = $('agenda a[href]')
    .map(getAttr('href'))
    .get()
    .filter(notExternal)
    .map(toFullPath)
    .map(convertToIndexHtml)

  log('Read links', links)

  // import links (decks)
  const imports = $('xp-deck link[href]')
    .map(getAttr('href'))
    .get()
    .filter(notExternal)
    .map(toFullPath)
    .map(convertToIndexHtml)

  log('Read imports', imports)

  // files
  const scripts = $('xp-editor script[src][highlight]')
    .map(getAttr('src'))
    .get()
    .filter(notExternal)
    .map(toFullPath)

  log('Read scripts', scripts)

  const recursive = await Promise.all(
    links
      .concat(imports)
      .filter(onlyHtml)
      .map(readHtmlFile)
  )

  return [
    ...links,
    ...imports,
    ...scripts,
    ...recursive.reduce(concat, [])
  ]
}

async function findTranslatableTexts (fileName) {
  const l = debug('findTexts')
  l(`Checking ${fileName}`)

  const patterns = getPatternsForFile(fileName)
  if (!patterns) {
    console.warn(`No comment pattern for ${fileName}`)
    return []
  }

  // read file
  const content = await util.promisify(fs.readFile)(fileName, 'utf8')
  const lines = content.split('\n')
  const matches = lines
    .map(line => patterns.reduce((match, pattern) => match || line.match(pattern), false))
    .filter(x => x)
    .map(match => {
      return {
        id: match[6] || match[1],
        match: match[0]
      }
    })

  l(`[${path.basename(fileName)}] Found ${matches.length} from comments`)

  // special processing of html files
  if (!onlyHtml(fileName)) {
    return matches
  }

  const $ = cheerio.load(content, cheerioOptions)

  // Find annotations
  const annotations = $('xp-annotations details').html()
  if (annotations) {
    matches.push({
      id: annotations,
      match: '<xp-annotations>details>'
    })
  }

  // Find header
  const header = $('xp-annotations header').html()
  if (header) {
    matches.push({
      id: header,
      match: '<xp-annotations>header>'
    })
  }

  // Asides
  $('aside').each((idx, el) => {
    const $el = $(el)
    const html = $el.html()
    const file = $el.attr('file')
    const order = $el.attr('order')

    matches.push({
      id: html,
      match: `<aside[file="${file}"][order=${order}]>`
    })
  })

  // Title
  const title = $('title').html()
  if (title) {
    matches.push({
      id: title,
      match: '<title>'
    })
  }

  // tasks
  $('xp-tasks li').each((idx, el) => {
    const $el = $(el)
    const html = $el.html()

    matches.push({
      id: html,
      match: `<xp-tasks li:nth-child(${idx + 1})>`
    })
  })

  return matches
}

function getPatternsForFile (fileName) {
  let ext = path.extname(fileName)
  if (!ext) {
    return
  }
  ext = ext.substr(1)

  const COMMENT = '\\s*(([0-9]+)\\/ )?(([0-9\\.]+)\\.)?\\s*([^\\-#].+)'
  const C_LIKE_PATTERN = new RegExp(`^\\s*///?(${COMMENT})`)
  const C_LIKE_PATTERN2 = new RegExp(`\\/\\*(${COMMENT})\\*\\/`)
  const C_LIKE_PATTERNS = [C_LIKE_PATTERN2, C_LIKE_PATTERN]
  const HASH_PATTERN = [new RegExp(`#(${COMMENT})`)]
  const HTML_LIKE = [new RegExp(`<!--(${COMMENT})-->`)]
  const JSON_PATTERN = [new RegExp(`"__.*": "(${COMMENT})"`)]
  const ELM_PATTERN = [new RegExp(`--(${COMMENT})`)]

  const LINE_PATTERNS = {
    'json': JSON_PATTERN.concat(C_LIKE_PATTERNS),
    'js': C_LIKE_PATTERNS,
    'ts': C_LIKE_PATTERNS,
    'rs': C_LIKE_PATTERNS,
    'css': C_LIKE_PATTERNS,
    'scss': C_LIKE_PATTERNS,
    'less': C_LIKE_PATTERNS,
    'java': C_LIKE_PATTERNS,
    'jsx': C_LIKE_PATTERNS,
    'go': C_LIKE_PATTERNS,
    'dart': C_LIKE_PATTERNS,
    'yaml': C_LIKE_PATTERNS,
    'yml': C_LIKE_PATTERNS,
    'py': HASH_PATTERN,
    'sh': HASH_PATTERN,
    'md': HASH_PATTERN.concat(HTML_LIKE),
    'styl': C_LIKE_PATTERNS,
    'html': HTML_LIKE,
    'elm': ELM_PATTERN
  }
  const PATTERN = fileName === '_console' ? HASH_PATTERN : LINE_PATTERNS[ext]
  return PATTERN
}
