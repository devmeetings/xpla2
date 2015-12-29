import {randomId} from './utils';
import fetch from 'isomorphic-fetch';

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

// We will first read the configuration to use right components
export function getEditorState (dom) {
  const id = dom.id || randomId('editor');
  dom.id = id;

  const files = [].map.call(
    dom.querySelectorAll('template,script'),
    (tpl) => {
      if (!tpl.src) {
        return Promise.resolve({
          name: tpl.id,
          content: fixPossibleScriptTags(trim(tpl.innerHTML))
        });
      }
      return fetch(tpl.src)
        .then((response) => response.text())
        .then((content) => ({
          name: tpl.id,
          content
        }));
    }
  );

  return Promise.all(files).then((filesResolved) => {
    return {
      id: id,
      files: filesResolved,
      active: filesResolved[0]
    };
  });
}
