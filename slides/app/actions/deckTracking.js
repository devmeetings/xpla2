// @flow

import {PRESENCE_CLIENTS, PRESENCE_CLIENT_SLIDE_UPDATE} from './index';
import {createAction} from 'redux-actions';

export const presenceClients = createAction(PRESENCE_CLIENTS);
export const presenceClientSlideUpdate = createAction(PRESENCE_CLIENT_SLIDE_UPDATE);
