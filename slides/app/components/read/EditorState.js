import {randomId} from './utils';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';

// We will first read the configuration to use right components
export function getEditorState (dom) {
  const id = dom.id || randomId('editor');
  dom.id = id;

  const active = dom.getAttribute('active');
  const showFileTree = dom.hasAttribute('tree');

  const files = [].map.call(
    dom.querySelectorAll('template,script'),
    (tpl) => {
      const extension = getExtension(tpl.id);

      if (!tpl.src) {
        const content = fixPossibleScriptTags(trim(tpl.innerHTML));
        const annotations = parseAnnotations(content, extension);
        const highlight = parseHighlight(tpl, annotations);

        return Promise.resolve({
          name: tpl.id,
          content,
          annotations,
          highlight
        });
      }

      return fetch(tpl.src)
        .then((response) => response.text())
        .then((content) => {
          const annotations = parseAnnotations(content, extension);
          const highlight = parseHighlight(tpl, annotations);

          return {
            name: tpl.id,
            content,
            annotations,
            highlight
          };
        });
    }
  );

  return Promise.all(files).then((filesResolved) => {
    return {
      id: id,
      showFileTree: showFileTree,
      files: filesResolved,
      active: _.find(filesResolved, (file) => file.name === active) || filesResolved[0]
    };
  });
}

function getExtension (name) {
  const p = name.split('.');
  return p[p.length - 1];
}

function parseAnnotations (content, ext) {
  const COMMENT = "\\s*(([0-9]+)\\/)?( ([0-9\\.]+)\\.)? (.+)"
  const C_LIKE_PATTERN = new RegExp(`(//${COMMENT})||/*${COMMENT}*/`);

  const LINE_PATTERNS = {
    'js': C_LIKE_PATTERN,
    'java': C_LIKE_PATTERN,
    'jsx': C_LIKE_PATTERN,
    'py': new RegExp(`#${COMMENT}`),
    'html': new RegExp(`<!--${COMMENT}-->`)
  };
  const PATTERN = LINE_PATTERNS[ext];
  if (!PATTERN) {
    return [];
  }

  const lines = content.split('\n');
  const annotations = [];
  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i];
    let match = line.match(PATTERN);

    if (match) {
      // get next lines
      let noOfLines = parseInt(match[3], 10) || 1;
      let order = parseInt(match[5], 10) || annotations.length + 1;
      let title = match[6];
      annotations.push({
        line: i,
        noOfLines,
        order,
        title,
        code: lines.slice(i + 1, i + 1 + noOfLines).join('\n') // TODO trim?
      });
      i += noOfLines;
    }
  }
  return annotations.sort((a, b) => a.order - b.order);
}


function trim (val) {
  // Get initial tabulation size
  const lines = val.split('\n');
  const tabs = val.match(/^\s+/)[0].replace(/\n/g, '');
  return lines
    .map((line) => {
      return line.replace(tabs, '');
    })
    .filter((l) => l)
    .join('\n')
    .replace(/\s+$/, '');
}

function fixPossibleScriptTags (val) {
  return val
    .replace(/<.\/script>/gi, '</script>');
}

function parseHighlight (dom, annotations) {
  if (!dom.hasAttribute('highlight')) {
    return [];
  }

  return annotations.map((anno) => ({
    from: anno.line + 1,
    to: anno.line + anno.noOfLines
  }));
}
