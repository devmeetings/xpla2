import {CHANGE_ACTIVE_TAB} from '../actions';
import {createReducer} from 'redux-immutablejs';
import {List} from 'immutable';

export default createReducer(List([]), {
  [CHANGE_ACTIVE_TAB]: (editors, action) => {
    const editorId = action.payload.editorId;
    const tabName = action.payload.tabName;

    const editor = editors.get(editorId);
    const activeFile = editor.get('files').find((file) => {
      return file.get('name') === tabName;
    });

    return editors.set(editorId, editor.set(
      'active',
      activeFile
    ));
  }
});
