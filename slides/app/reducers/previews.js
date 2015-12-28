import {COMMIT_AND_RUN_CODE, COMMIT_AND_RUN_CODE_STARTED} from '../actions';
import {createReducer} from 'redux-immutablejs';
import {Map} from 'immutable';

export default createReducer(Map({}), {
  [COMMIT_AND_RUN_CODE_STARTED]: (previews, action) => {
    const previewId = action.payload.previewId;
    const preview = previews.get(previewId);
    return previews
      .set(previewId, preview.set('isLoading', true));
  },
  [COMMIT_AND_RUN_CODE]: (previews, action) => {
    const previewId = action.payload.previewId;
    const preview = previews.get(previewId);

    const newPreview = preview
      .set('isLoading', false)
      .set('runId', action.payload.runId);

    return previews
      .set(previewId, newPreview);
  }
});
