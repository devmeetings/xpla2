import {randomId} from './utils';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';

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

function parseHighlight (dom) {
  if (!dom.hasAttribute('highlight')) {
    return [];
  }
  const highlightString = dom.getAttribute('highlight');
  return highlightString.split(',').map((pattern) => {
    const parts = pattern
      .split('-')
      .map((no) => parseInt(no, 10))
      .map((no) => no - 1);
    // Validation
    parts.forEach((no) => {
      if (isNaN(no) || no < 0) {
        throw new Error(`Unable to parse highlights for ${dom.id}. Problem with: ${pattern}`);
      }
    });

    return {
      from: parts[0],
      to: parts[1] || parts[0]
    };
  });
}

// We will first read the configuration to use right components
export function getEditorState (dom) {
  const id = dom.id || randomId('editor');
  dom.id = id;

  const active = dom.getAttribute('active');

  const files = [].map.call(
    dom.querySelectorAll('template,script'),
    (tpl) => {
      const highlight = parseHighlight(tpl);

      if (!tpl.src) {
        return Promise.resolve({
          name: tpl.id,
          content: fixPossibleScriptTags(trim(tpl.innerHTML)),
          highlight
        });
      }
      return fetch(tpl.src)
        .then((response) => response.text())
        .then((content) => ({
          name: tpl.id,
          content,
          highlight
        }));
    }
  );

  return Promise.all(files).then((filesResolved) => {
    return {
      id: id,
      files: filesResolved,
      active: _.find(filesResolved, (file) => file.name === active) || filesResolved[0]
    };
  });
}
