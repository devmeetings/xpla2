const Joi = require('joi');

const SLIDE_UPDATE = 'tracking:slideUpdate';
const CLIENTS = 'tracking:clients';

class ConnectedClients {
  constructor (server) {
    this.server = server;
    this.connectedClients = {};
  }

  updateSlide (origin, client, slide, annotation) {
    const cl = this.connectedClients[origin][client];
    cl.currentSlide = slide;
    cl.annotation = annotation;

    this.server.publish(`/tracking/${origin}`, {
      type: SLIDE_UPDATE,
      client,
      slide,
      annotation
    });
  }

  newClient (origin, client) {
    this.connectedClients[origin] = this.connectedClients[origin] || {};
    this.connectedClients[origin][client] = {
      active: true,
      currentSlide: null,
      annotation: 0
    };

    this.server.publish(`/tracking/${origin}`, {
      type: CLIENTS,
      clients: this.clients(origin)
    });
  }

  removeClient (origin, client) {
    delete this.connectedClients[origin][client];

    this.server.publish(`/tracking/${origin}`, {
      type: CLIENTS,
      clients: this.clients(origin)
    });
  }

  clients (origin) {
    return this.connectedClients[origin];
  }
}

module.exports = function tracking (server) {
  const clients = new ConnectedClients(server);

  server.route({
    method: 'POST',
    path: '/tracking/{origin}/slide',
    config: {
      validate: {
        payload: {
          newSlideId: Joi.string().required(),
          annotation: Joi.number().default(-1)
        }
      },
      handler (req, reply) {
        const { origin } = req.params;
        const { id } = req.socket;
        const { newSlideId, annotation } = req.payload;

        clients.updateSlide(origin, id, newSlideId, annotation);

        return reply('OK');
      }
    }
  });

  server.subscription('/tracking/{origin}', {
    filter (path, message, options, next) {
      next(!message.client || options.socket.id !== message.client);
    },
    onSubscribe (socket, path, params, next) {
      const { origin } = params;

      next();

      clients.newClient(origin, socket.id);
    },
    onUnsubscribe (socket, path, params, next) {
      const { origin } = params;

      clients.removeClient(origin, socket.id);

      next();
    }
  });
};
