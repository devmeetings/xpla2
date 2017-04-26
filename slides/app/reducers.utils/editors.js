import _ from 'lodash';

export function findEditorFileByName (editor, tabName) {
  const activeFile = editor.get('files').findEntry((file) => {
    return file.get('name') === tabName;
  });
  return activeFile;
}

export function getFilesWithActive (editor) {
  const active = editor.get('active');
  const idx = findEditorFileByName(editor, active.get('name'))[0];
  return editor.get('files').set(idx, active);
}

export function getFilesWithActiveAsJsArray (editor) {
  return _.values(editor.files).map((file) => {
    if (file.name === editor.active.name) {
      return editor.active;
    }
    return file;
  });
}
