import {createReducer} from 'redux-immutablejs';
import {fromJS} from 'immutable';

import {
  SLIDE_CHANGE_ANNOTATION,
  WORK_MODE_EDIT_ANNOTATIONS,
  WORK_MODE_EDIT_EDITOR_ANNOTATION
} from '../actions';

export default createReducer(fromJS({
  title: '',
  header: '',
  details: '',
  currentAnnotation: -1,
  annotations: {}
}), {
  [SLIDE_CHANGE_ANNOTATION]: (annotations, action) => {
    return annotations.set('currentAnnotation', action.payload);
  },
  [WORK_MODE_EDIT_ANNOTATIONS]: (annotations, action) => {
    const {prop, value} = action.payload;
    return annotations.set(prop, value);
  },
  [WORK_MODE_EDIT_EDITOR_ANNOTATION]: (annotations, action) => {
    const {description, fileName, order} = action.payload;
    // Check if file exists.
    const fileAnnos = annotations.getIn(['annotations', fileName]);
    if (!fileAnnos) {
      return annotations.setIn(['annotations', fileName], fromJS([{
        file: fileName,
        order: order,
        content: description
      }]));
    }

    // Look for existing annotation.
    const existing = fileAnnos.findEntry(annotation => annotation.get('order') === order);
    if (!existing) {
      return annotations.setIn(['annotations', fileName], fileAnnos.push(fromJS({
        file: fileName,
        order: order,
        content: description
      })));
    }

    const [key, anno] = existing;
    return annotations.setIn(['annotations', fileName, key, 'content'], description);
  }
});
