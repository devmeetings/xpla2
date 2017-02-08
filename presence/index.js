const Hapi = require('hapi');
const Nes = require('nes');
const Good = require('good');

const tracking = require('./tracking');

const server = new Hapi.Server();
server.connection({
  port: process.env.PORT || 3040
});

server.register([
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
  },
  Nes
], err => {
  if (err) {
    throw err;
  }

  server.start(err => {
    if (err) {
      throw err;
    }

    tracking(server);
  });
});
