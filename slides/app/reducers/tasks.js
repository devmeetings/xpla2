import {createReducer} from 'redux-immutablejs';
import {fromJS} from 'immutable';

export default createReducer(fromJS({
  time: 50,
  header: '',
  tasks: []
}), {});
