import {COMMIT_AND_RUN_CODE, COMMIT_AND_RUN_CODE_LONG, COMMIT_AND_RUN_CODE_ERROR, COMMIT_AND_RUN_CODE_STARTED, MODIFY_ACTIVE_TAB_CONTENT} from '../actions'
import {createReducer} from 'redux-immutablejs'
import {Map} from 'immutable'

export default createReducer(Map({}), {
  [MODIFY_ACTIVE_TAB_CONTENT]: (previews, action) => {
    // TODO probably should affect only one preview!
    return previews.map((preview) => {
      return preview.set('isFresh', false)
    })
  },
  [COMMIT_AND_RUN_CODE_STARTED]: (previews, action) => {
    const previewId = action.payload.previewId
    const preview = previews.get(previewId)
    return previews
      .set(previewId, preview
           .set('isLoading', true)
           .set('isError', false)
           .set('isFresh', true)
           .set('isTakingLong', false)
      )
  },
  [COMMIT_AND_RUN_CODE_LONG]: (previews, action) => {
    const previewId = action.payload.previewId
    const preview = previews.get(previewId)
    return previews
      .set(previewId, preview.set('isTakingLong', true))
  },
  [COMMIT_AND_RUN_CODE_ERROR]: (previews, action) => {
    const previewId = action.payload.previewId
    const preview = previews.get(previewId)
    return previews
      .set(previewId, preview
           .set('isLoading', false)
           .set('isError', true)
           .set('isTakingLong', false)
           .set('runId', null)
      )
  },
  [COMMIT_AND_RUN_CODE]: (previews, action) => {
    const { previewId, runId, port, url } = action.payload
    const preview = previews.get(previewId)

    const newPreview = preview
      .set('isLoading', false)
      .set('isTakingLong', false)
      .set('runId', runId)
      .set('port', port)
      .set('url', url)

    return previews
      .set(previewId, newPreview)
  }
})
