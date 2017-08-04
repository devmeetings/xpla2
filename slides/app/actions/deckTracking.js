// @flow

import {
  PRESENCE_CONNECTION, PRESENCE_CLIENTS, PRESENCE_CLIENT_SLIDE_UPDATE, PRESENCE_CLIENT_ACTIVE
} from './index'
import {createAction} from 'redux-actions'

export const presenceConnection = createAction(PRESENCE_CONNECTION)
export const presenceClients = createAction(PRESENCE_CLIENTS)
export const presenceClientSlideUpdate = createAction(PRESENCE_CLIENT_SLIDE_UPDATE)
export const presenceClientActive = createAction(PRESENCE_CLIENT_ACTIVE)
