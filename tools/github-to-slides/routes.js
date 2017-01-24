const Joi = require('joi');

const hook = require('./api/hook');
const generate = require('./api/generate');

function handleError (e, reply) {
  // Not found
  if (e.code === 404) {
    return reply(e.toString()).code(404);
  }
  if (e.code === 401) {
    return reply(e.toString()).code(401);
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

const safePattern = /^[a-z0-9._-]+$/i;

module.exports = [
  {
    method: 'POST',
    path: '/api/generate',
    config: {
      validate: {
        payload: {
          username: Joi.string().regex(safePattern).required(),
          repo: Joi.string().regex(safePattern).required(),
          branch: Joi.string().regex(safePattern).default('master')
        }
      },
      handler: (req, reply) => {
        generate(req.payload.username, req.payload.repo, req.payload.branch)
          .then(reply)
          .catch(e => handleError(e, reply));
      }
    }
  },
  {
    method: 'POST',
    path: '/api/hook',
    config: {
      handler: (req, reply) => {
        hook(req.payload)
          .then(reply)
          .catch(e => handleError(e, reply));
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
