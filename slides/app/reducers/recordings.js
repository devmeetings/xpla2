// @flow

import {STATE_NORMAL, STATE_RECORDING, VIEW_NORMAL, VIEW_ADMIN} from '../reducers.utils/recordings';

import {RECORDING_STATE_TOGGLE, RECORDING_VIEW_TOGGLE, RECORDING_RESET, RECORDING_SET} from '../actions';
import {DECK_SLIDE_CHANGE} from '../actions';

import {fromJS} from 'immutable';
import {createReducer} from 'redux-immutablejs';

export default createReducer(fromJS({
  state: STATE_NORMAL,
  view: VIEW_NORMAL,
  started: 0,
  recordings: [],
}), {
  [RECORDING_SET]: (state, action) => {
    const {recordings, started} = action.payload;
    return state
      .set('recordings', fromJS(recordings))
      .set('started', started);
  },

  [RECORDING_STATE_TOGGLE]: (state, action) => {
    const map = {
      [STATE_NORMAL]: [STATE_RECORDING, VIEW_NORMAL],
      [STATE_RECORDING]: [STATE_NORMAL, VIEW_ADMIN],
    };

    const [newState, newView] = map[state.get('state')];

    let state2 = state
      .set('state', newState)
      .set('view', newView);

    if (newState === STATE_RECORDING) {
      const rec = state.get('recordings');
      // set started to last recording or now.
      const started = rec.size > 0 ? rec.get(rec.size - 1).get('timestamp') + 1000 + state.get('started') : Date.now();
      state2 = state2.set('started', started);
    }

    return state2;
  },

  [RECORDING_VIEW_TOGGLE]: (state, action) => {
    const map = {
      [VIEW_NORMAL]: VIEW_ADMIN,
      [VIEW_ADMIN]: VIEW_NORMAL,
    };

    return state.set('view', map[state.get('view')]);
  },

  [RECORDING_RESET]: (state, action) => {
    return state.set('recordings', fromJS([]));
  },

  [DECK_SLIDE_CHANGE]: (state, action) => {
    if (state.get('state') !== STATE_RECORDING) {
      return state;
    }

    return state.set('recordings', state.get('recordings').push({
      timestamp: Date.now() - state.get('started'),
      action
    }));
  },
});
