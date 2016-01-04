import {createStore, applyMiddleware} from 'redux';
import {combineReducers} from 'redux-immutablejs';
import thunk from 'redux-thunk';

import {fromJS} from 'immutable';

import logger from './components/logger';

import reducers from './reducers';
import globalReducer from './reducers/global/index';

export default function (initialState) {

  const reducer = combineReducers(reducers);

  return applyMiddleware(
      thunk,
      (store) => (next) => (action) => {
        logger.log(store.getState().toJS());
        logger.log(action);
        next(action);
      }
    )(
      createStore
    )(
      (state, action) => {
        const newState = reducer(state, action);
        return globalReducer(newState, action);
      },
      fromJS(initialState)
    );
}
