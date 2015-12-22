'use strict';

const Hapi = require('hapi');
const Good = require('good');
const Lout = require('lout');
const Vision = require('vision');
const Inert = require('inert');

const Routes = require('./routes');

const server = new Hapi.Server();
server.connection({
  port: 3030,
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
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log: '*'
        }
      }]
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
