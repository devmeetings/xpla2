const Joi = require('joi');

const getHelp = require('./api/help');
const getGitHelp = require('./api/help-git');
const codeApi = require('./api/code');
const resultsApi = require('./api/results');

const runners = Object.keys(require('./runners/workers').runners);

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
    method: 'GET',
    path: '/',
    handler: (req, reply) => {
      reply.redirect('http://devmeetings.pl');
    }
  },
  {
    method: 'GET',
    path: '/help',
    handler: (req, reply) => {
      reply(getHelp());
    }
  },
  {
    method: 'GET',
    path: '/git/help',
    handler: (req, reply) => {
      reply(getGitHelp());
    }
  },
  {
    method: 'GET',
    path: '/git/{param*}',
    handler: {
      directory: {
        path: 'static'
      }
    }
  },
  {
    method: 'GET',
    path: '/cdn/{param*}',
    handler: {
      directory: {
        path: 'cdn'
      }
    }
  },
  {
    method: 'POST',
    path: '/api/commits',
    config: {
      validate: {
        payload: {
          files: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            content: Joi.string().allow('').default('')
          })).min(1).required()
        }
      },
      handler: (req, reply) => {
        codeApi.commitCode(req.payload)
          .then(reply)
          .catch((e) => handleError(e, reply));
      }
    }
  },
  {
    method: 'POST',
    path: '/api/commitAndRun',
    config: {
      validate: {
        payload: {
          runnerName: runnerSchema(),
          skipCache: Joi.boolean().default(false),
          files: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            content: Joi.string().allow('').default('')
          })).min(1).required()
        }
      },
      handler: (req, reply) => {
        codeApi.commitAndRunCode(req.payload)
          .then(reply)
          .catch((e) => handleError(e, reply));
      }
    }
  },
  {
    method: 'POST',
    path: '/api/commits/{commitId}/run/{runnerName}',
    config: {
      validate: {
        params: {
          skipCache: Joi.boolean().default(false),
          commitId: Joi.string().required(),
          runnerName: runnerSchema()
        }
      },
      handler: (req, reply) => {
        codeApi.runCode({
          commitId: req.params.commitId,
          runnerName: req.params.runnerName
        })
          .then(reply)
          .catch((e) => handleError(e, reply));
      }
    }
  },
  {
    method: 'GET',
    path: '/api/results/{runId}.json/{field?}',
    handler: (req, reply) => {
      resultsApi.getRaw({
        runId: req.params.runId,
        field: req.params.field
      })
        .then((file) => {
          reply(file);
        })
        .catch((e) => handleError(e, reply));
    }
  },
  {
    method: 'GET',
    path: '/api/results/{runId}/{fileName*}',
    handler: (req, reply) => {
      resultsApi.getFile({
        runId: req.params.runId,
        fileName: req.params.fileName
      })
        .then((file) => {
          reply(file.content).type(file.mimetype);
        })
        .catch((e) => handleError(e, reply));
    }
  },
  {
    method: 'DELETE',
    path: '/api/results/{runId}',
    handler: (req, reply) => {
      resultsApi.clear(req.params.runId)
        .then(ok => {
          reply(ok);
        })
        .catch(e => handleError(e, reply));
    }
  }

];

function runnerSchema () {
  return Joi.any().valid(runners).required();
}
