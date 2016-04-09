const Joi = require('joi');

const generate = require('./api/generate');

function handleError (e, reply) {
  // Not found
  if (e.code === 404) {
    return reply(e.toString()).code(404);
  }
  // Service Unavailable
  if (e.code === 503) {
    return reply(e.toString()).code(503);
  }
  // Internal Server Error
  reply(e.toString).code(500);
  setTimeout(() => {
    throw e;
  });
}

module.exports = [
  {
    method: 'POST',
    path: '/api/generate',
    config: {
      validate: {
        payload: {
          username: Joi.string().required(),
          repo: Joi.string().required()
        }
      },
      handler: (req, reply) => {
        generate(req.payload.username, req.payload.repo)
          .then(reply)
          .catch(e => handleError(reply));
      }
    }
  },
  {
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'static'
      }
    }
  }
];
