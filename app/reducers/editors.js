import {CHANGE_ACTIVE_TAB, MODIFY_ACTIVE_TAB_CONTENT} from '../actions';
import {createReducer} from 'redux-immutablejs';
import {List} from 'immutable';

function findEditorFileByName (editor, tabName) {
  const activeFile = editor.get('files').findEntry((file) => {
    return file.get('name') === tabName;
  });
  return activeFile;
}

export default createReducer(List([]), {
  [CHANGE_ACTIVE_TAB]: (editors, action) => {
    const editorId = action.payload.editorId;
    const tabName = action.payload.tabName;

    const editor = editors.get(editorId);
    const activeFile = findEditorFileByName(editor, tabName)[1];

    const previouslyActiveFile = editor.get('active');
    const idx = findEditorFileByName(editor, previouslyActiveFile.get('name'))[0];

    const newEditor = editor
      // update active
      .set('active', activeFile)
      // resync files array
      .set('files', editor.get('files').set(idx, previouslyActiveFile));

    return editors.set(editorId, newEditor);
  },
  [MODIFY_ACTIVE_TAB_CONTENT]: (editors, action) => {
    const editorId = action.payload.editorId;
    const content = action.payload.content;

    const editor = editors.get(editorId);

    return editors.set(editorId, editor.set(
      'active',
      editor
        .get('active')
        .set('content', content)
    ));
  }
});
