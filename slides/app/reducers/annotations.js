import {createReducer} from 'redux-immutablejs';
import {fromJS} from 'immutable';

import {WORK_MODE_EDIT_ANNOTATIONS} from '../actions';

export default createReducer(fromJS({
  title: '',
  header: '',
  details: '',
  annotations: {}
}), {
  [WORK_MODE_EDIT_ANNOTATIONS]: (annotations, action) => {
    const {prop, value} = action.payload;
    return annotations.set(prop, value);
  }
});
