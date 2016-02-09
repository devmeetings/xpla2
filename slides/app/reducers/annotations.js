import {createReducer} from 'redux-immutablejs';
import {fromJS} from 'immutable';

export default createReducer(fromJS({
  title: '',
  header: '',
  details: '',
  annotations: {}
}), {});
