// @flow

import {STATE_NORMAL, STATE_RECORDING, STATE_PLAYING, VIEW_NORMAL, VIEW_ADMIN} from '../reducers.utils/recordings'

import {
  RECORDING_STATE_TOGGLE, RECORDING_VIEW_TOGGLE, RECORDING_RESET, RECORDING_SET,
  DECK_SLIDE_CHANGE, DECK_SLIDE_ACTION
} from '../actions'

import {fromJS} from 'immutable'
import {createReducer} from 'redux-immutablejs'

export default createReducer(fromJS({
  state: STATE_NORMAL,
  view: VIEW_NORMAL,
  started: 0,
  recordings: []
}), {
  [RECORDING_SET]: (state, action) => {
    const {recordings, started} = action.payload
    return state
      .set('recordings', fromJS(recordings))
      .set('started', started)
  },

  [RECORDING_STATE_TOGGLE]: (state, action) => {
    const isPlayState = action.payload

    const recMap = {
      [STATE_NORMAL]: [STATE_RECORDING, VIEW_NORMAL],
      [STATE_RECORDING]: [STATE_NORMAL, VIEW_ADMIN],
      [STATE_PLAYING]: [STATE_NORMAL, VIEW_NORMAL]
    }

    const playMap = {
      [STATE_NORMAL]: [STATE_PLAYING, VIEW_NORMAL],
      [STATE_RECORDING]: [STATE_NORMAL, VIEW_ADMIN],
      [STATE_PLAYING]: [STATE_NORMAL, VIEW_NORMAL]
    }

    const [newState, newView] = isPlayState ? playMap[state.get('state')] : recMap[state.get('state')]

    let state2 = state
      .set('state', newState)
      .set('view', newView)

    if (newState === STATE_RECORDING) {
      const rec = state.get('recordings')
      // set started to last recording or now.
      const started = rec.size > 0 ? Date.now() - rec.get(rec.size - 1).get('timestamp') - 1000 : Date.now()
      state2 = state2.set('started', started)
    }

    return state2
  },

  [RECORDING_VIEW_TOGGLE]: (state, action) => {
    const map = {
      [VIEW_NORMAL]: VIEW_ADMIN,
      [VIEW_ADMIN]: VIEW_NORMAL
    }

    return state.set('view', map[state.get('view')])
  },

  [RECORDING_RESET]: (state, action) => {
    return state.set('recordings', fromJS([]))
  },

  [DECK_SLIDE_CHANGE]: addAction,
  [DECK_SLIDE_ACTION]: (state, action) => {
    return addAction(state, action.payload)
  }
})

function addAction (state, action) {
  if (state.get('state') !== STATE_RECORDING) {
    return state
  }

  return state.set('recordings', state.get('recordings').push(fromJS({
    timestamp: Date.now() - state.get('started'),
    action
  })))
}
