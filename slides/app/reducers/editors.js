import {CHANGE_ACTIVE_TAB, MODIFY_ACTIVE_TAB_CONTENT} from '../actions'

import {createReducer} from 'redux-immutablejs'
import {Map} from 'immutable'

import {findEditorFileByName, getFilesWithActive} from '../reducers.utils/editors'

export default createReducer(Map({}), {
  [CHANGE_ACTIVE_TAB]: (editors, action) => {
    const editorId = action.payload.editorId
    const tabName = action.payload.tabName

    const editor = editors.get(editorId)
    const activeFile = findEditorFileByName(editor, tabName)[1]

    const newEditor = editor
      // update active
      .set('active', activeFile)
      // resync files array
      .set('files', getFilesWithActive(editor))

    return editors.set(editorId, newEditor)
  },
  [MODIFY_ACTIVE_TAB_CONTENT]: (editors, action) => {
    const editorId = action.payload.editorId
    const content = action.payload.content

    const editor = editors.get(editorId)

    return editors.set(editorId, editor.set(
      'active',
      editor
        .get('active')
        .set('content', content)
        .set('touched', true)
    ))
  }
})
