// @flow

import {
  PRESENCE_CONNECTION, PRESENCE_CLIENTS, PRESENCE_CLIENT_SLIDE_UPDATE, PRESENCE_CLIENT_ACTIVE
} from '../actions'

import {fromJS} from 'immutable'
import {createReducer} from 'redux-immutablejs'

export default createReducer(fromJS({
  active: false,
  id: null,
  clients: {}
}), {

  [PRESENCE_CONNECTION]: (state, action) => {
    const { active, id } = action.payload
    return state.set('active', active).set('id', id)
  },

  [PRESENCE_CLIENTS]: (state, action) => {
    delete action.payload[state.get('id')]
    return state.set('clients', fromJS(action.payload))
  },

  [PRESENCE_CLIENT_SLIDE_UPDATE]: (state, action) => {
    const { client, slide, annotation } = action.payload

    return state
      .setIn(['clients', client, 'currentSlide'], slide)
      .setIn(['clients', client, 'annotation'], annotation)
  },

  [PRESENCE_CLIENT_ACTIVE]: (state, action) => {
    const { client, isActive } = action.payload

    return state
      .setIn(['clients', client, 'isActive'], isActive)
  }

})
