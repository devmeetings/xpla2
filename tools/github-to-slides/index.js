'use strict';

const Hapi = require('hapi');
const Good = require('good');
const Lout = require('lout');
const Vision = require('vision');
const Inert = require('inert');

const Routes = require('./routes');

const server = new Hapi.Server();
server.connection({
  port: process.env.PORT || 3035,
  routes: {
    cors: true
  }
});

server.register([
  Vision,
  Inert,
  {
    register: Lout,
    options: {
      endpoint: '/docs'
    }
  },
  {
    register: Good,
    options: {
      reporters: {
        console: [{
          module: 'good-console',
          args: [{
            response: '*',
            log: '*'
          }]
        }, 'stdout']
      }
    }
  }
], (err) => {
  if (err) {
    throw err; // something bad happened loading the plugin
  }

  server.route(Routes);

  server.start(() => {
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});
