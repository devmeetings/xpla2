import _ from 'lodash';
import {Client} from 'nes/client';

import {presenceClients, presenceClientSlideUpdate} from '../../actions/deckTracking';
import { DECK_SLIDE_CHANGE } from '../../actions';

const forwarding = {
  [DECK_SLIDE_CHANGE](request, origin, action) {
    request(`/tracking/${origin}/slide`, {
      payload: action.payload
    });
  }
};

function processIncoming (store, message) {
  switch (message.type) {
  case 'tracking:clients':
    store.dispatch(presenceClients(message.clients));
    return;
  case 'tracking:slideUpdate':
    store.dispatch(presenceClientSlideUpdate(message));
    return;
  default:
    console.warn('Ignored message', message);
  }
}

function forwardOutgoing (ws, origin, action, next) {
  if (forwarding[action.type]) {
    forwarding[action.type](request(ws), origin, action);
  }

  return next(action);
}

function request (ws, origin) {
  return (path, options) => {
    ws.request(_.assign({
      path: path,
      method: 'POST'
    }, options), err => {
      if (err) {
        console.warn(`Failed sending a presence notification to ${path}`, err);
      }
    });
  };
}

export default store => {
  const url = store.getState().get('presenceServerUrl');
  const path = window.location.pathname.split('/')[1] || '';
  const host = window.location.origin.replace(/^https?:\/\//, '');
  const origin = `${host}-${path}`;

  if (!url) {
    return next => action => {
      return next(action);
    };
  }

  const ws = new Client(url, {
    timeout: 5000
  });

  ws.connect(err => {
    if (err) {
      console.error('Unable to connect to presence API.');
      return;
    }

    console.log(`[${ws.id}] Subscribing to ${origin}`);

    ws.subscribe(
      `/tracking/${origin}`,
      (message) => processIncoming(store, message),
      () => {
        console.log(store.getState().getIn(['deck', 'active', 'id']));
        // Send current slide
        request(ws)(`/tracking/${origin}/slide`, {
          payload: {
            newSlideId: store.getState().getIn(['deck', 'active', 'id'])
          }
        })
      }
    );
  });

  return next => action => {
    return forwardOutgoing(ws, origin, action, next);
  };
}
