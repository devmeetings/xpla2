import {findId} from './utils'
import fetch from 'isomorphic-fetch'
import _ from 'lodash'

// We will first read the configuration to use right components
export function getEditorState (dom, path) {
  const id = dom.id || findId('editor', dom)
  dom.id = id

  const active = dom.getAttribute('active')
  const showFileTree = dom.hasAttribute('tree')

  const files = [].map.call(
    dom.querySelectorAll('template,script'),
    (tpl) => {
      const extension = getExtension(tpl.id)

      if (!tpl.src) {
        const content = fixPossibleScriptTags(trim(tpl.innerHTML))
        const {fileOrder, annotations} = parseAnnotations(content, extension, tpl.id)
        const highlight = parseHighlight(tpl, annotations)

        return Promise.resolve({
          name: tpl.id,
          fileOrder,
          content,
          annotations,
          highlight
        })
      }

      if (path) {
        tpl.setAttribute('src', path + tpl.getAttribute('src'))
      }

      return fetch(tpl.src, {
        credentials: 'same-origin'
      })
        .then((response) => {
          if (response.status === 200) {
            return response.text()
          }

          console.warn(`File not found ${tpl.src}`)
          return ''
        })
        .then((content) => {
          const {fileOrder, annotations} = parseAnnotations(content, extension, tpl.id)
          const highlight = parseHighlight(tpl, annotations)

          return {
            name: tpl.id,
            fileOrder,
            content,
            annotations,
            highlight
          }
        })
    }
  )

  return Promise.all(files).then((filesResolved) => {
    return {
      id: id,
      showFileTree: showFileTree,
      files: filesResolved,
      active: _.find(filesResolved, (file) => file.name === active) || filesResolved[0]
    }
  })
}

function getExtension (name) {
  const p = name.split('.')
  return p[p.length - 1]
}

function parseAnnotations (content, ext, fileName) {
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
    'html': HTML_LIKE.concat(C_LIKE_PATTERNS),
    'vue': HTML_LIKE.concat(C_LIKE_PATTERNS),
    'elm': ELM_PATTERN,
    'toml': HASH_PATTERN
  }
  const PATTERN = fileName === '_console' ? HASH_PATTERN : LINE_PATTERNS[ext]
  if (!PATTERN) {
    return {
      fileOrder: 9999,
      annotations: []
    }
  }

  let fileOrder = 9999
  const lines = content.split('\n')
  const annotations = []

  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i]
    let match = PATTERN.reduce((match, pattern) => match || line.match(pattern), false)
    if (match) {
      // Check for order comment
      if (i === 0) {
        const orderMatch = match[6].match(/o(rder)?:\s*([0-9]+)/i)
        if (orderMatch) {
          fileOrder = parseInt(orderMatch[2], 10)
          continue
        }
      }

      // get next lines
      let noOfLines = parseInt(match[3], 10) || 1
      let order = parseInt(match[5], 10) || annotations.length + 1
      let title = match[6]

      // Skip annotation if there was another one right above
      let len = annotations.length
      if (len > 0 && annotations[len - 1].highlight[0] === i) {
        // Extend range of higlight to cover next lines too.
        annotations[len - 1].highlight[1] = Math.max(annotations[len - 1].highlight[1], i + 1 + noOfLines)
        continue
      }

      annotations.push({
        line: i,
        noOfLines,
        order,
        title,
        ext,
        fileName,
        code: content,
        highlight: [i + 1, i + 1 + noOfLines]
      })
    }
  }

  const sortedAnnotations = annotations.sort((a, b) => a.order - b.order);
  if (fileOrder === 9999 && sortedAnnotations.length) {
    fileOrder = sortedAnnotations[0].order
  }

  return {
    fileOrder,
    annotations: sortedAnnotations
  }
}

function trim (val) {
  // Get initial tabulation size
  const lines = val.split('\n')
  const tabs = val.match(/^\s+/)[0].replace(/\n/g, '')
  return lines
    .map((line) => {
      return line.replace(tabs, '')
    })
    .filter((l, k) => k !== 0 || l)
    .join('\n')
    .replace(/\s+$/, '')
}

function fixPossibleScriptTags (val) {
  return val
    .replace(/<.\/script>/gi, '</script>')
}

function parseHighlight (dom, annotations) {
  if (!dom.hasAttribute('highlight')) {
    return []
  }

  if (!annotations.length) {
    return [{
      from: 1,
      to: Infinity
    }]
  }

  return annotations.map((anno) => ({
    from: anno.line + 1,
    to: anno.line + anno.noOfLines
  }))
}
