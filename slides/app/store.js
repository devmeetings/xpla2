import {createStore, applyMiddleware} from 'redux';
import {combineReducers} from 'redux-immutablejs';
import thunk from 'redux-thunk';

import {fromJS} from 'immutable';

import reducers from './reducers';

export default function (initialState) {

  const reducer = combineReducers(reducers);

  return applyMiddleware(
      thunk,
      (store) => (next) => (action) => {
        console.log(store.getState().toJS());
        console.log(action);
        next(action);
      }
    )(
      createStore
    )(
      reducer,
      fromJS(initialState)
    );
}
