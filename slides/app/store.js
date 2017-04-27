// @flow

import {createStore, applyMiddleware} from 'redux'
import {combineReducers} from 'redux-immutablejs'
import thunk from 'redux-thunk'

import {fromJS} from 'immutable'

import logger from './components/logger'

import { deck, slide } from './reducers'
import globalReducer from './reducers/global/index'
import presence from './middlewares/presence/index'
import recordings from './middlewares/recordings/index'
import forwarder from './middlewares/slide.forwarder/index'

function initStore (reducers, middlewares) {
  return (initialState: any) => {
    const reducer = combineReducers(reducers)

    return applyMiddleware.apply(null, [
      thunk,
      (store) => (next) => (action) => {
        logger.log(store.getState().toJS())
        logger.log(action)
        next(action)
      }
    ].concat(middlewares))(
      createStore
    )(
      (state, action) => {
        const newState = reducer(state, action)
        return globalReducer(newState, action)
      },
      fromJS(initialState),
      window.devToolsExtension && window.devToolsExtension()
    )
  }
}

export function deckStore (initialState: any, slideEvents: any) {
  return initStore(deck, [presence, recordings(slideEvents)])(initialState)
}

export function slideStore (initialState: any, globalEvents: any) {
  return initStore(slide, [forwarder(globalEvents)])(initialState)
}
