const Hapi = require('hapi');
const Nes = require('nes');
const Good = require('good');

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

  server.subscription('/item/{id}');

  server.start(err => {
    if (err) {
      throw err;
    }

    setInterval(() => {
      console.log('publishing');
      server.publish('/item/5', {
        id: 5,
        status: 'complete'
      });
    }, 10000);
  });
});
