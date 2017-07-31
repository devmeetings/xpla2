// @flow

import {PRESENCE_CONNECTION, PRESENCE_CLIENTS, PRESENCE_CLIENT_SLIDE_UPDATE} from './index'
import {createAction} from 'redux-actions'

export const presenceConnection = createAction(PRESENCE_CONNECTION)
export const presenceClients = createAction(PRESENCE_CLIENTS)
export const presenceClientSlideUpdate = createAction(PRESENCE_CLIENT_SLIDE_UPDATE)
