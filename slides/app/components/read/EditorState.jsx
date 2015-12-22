import {randomId} from './utils';

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

// We will first read the configuration to use right components
export function getEditorState (dom) {
  const id = dom.id || randomId('editor');
  dom.id = id;

  const files = [].map.call(
    dom.querySelectorAll('script'),
    (tpl) => {
      // TODO support lazy loading templates
      return {
        name: tpl.id,
        content: trim(tpl.innerHTML)
      };
    }
  );
  return {
    id: id,
    files: files,
    active: files[0]
  };
}
