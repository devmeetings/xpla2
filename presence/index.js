const Hapi = require('hapi');
const Nes = require('nes');
const Good = require('good');

const server = new Hapi.Server();
server.connection({
  port: process.env.PORT || 3040,
});

server.register([
  Nes,
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
], err => {
  if (err) {
    throw err;
  }

  server.subscription('/item/{id}');
  server.start(err => {
    server.publish('/item/5', { id: 5, status: 'complete'});
  });
});
