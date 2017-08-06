'use strict';

const Good = require('good');
const Hapi = require('hapi');
const Inert = require('inert');
const Lout = require('lout');
const Vision = require('vision');
const h2o2 = require('h2o2');

const Routes = require('./routes');

const server = new Hapi.Server();
server.connection({
  port: process.env.PORT || 3030,
  routes: {
    cors: true
  }
});

server.register([
  {
    register: h2o2
  },
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
