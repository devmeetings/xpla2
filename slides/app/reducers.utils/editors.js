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

