const Joi = require('joi');
const codeApi = require('./api/code');
const resultsApi = require('./api/results');

function handleError (e, reply) {
  if (e.code === 404) {
    return reply(e.toString()).code(404);
  }
  throw e;
}

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (req, reply) => {
      reply('Hello World');
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
            content: Joi.string().required()
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
          runnerName: Joi.string().required(),
          files: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            content: Joi.string().required()
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
    handler: (req, reply) => {
      codeApi.runCode({
        commitId: req.params.commitId,
        runnerName: req.params.runnerName
      })
        .then(reply)
        .catch((e) => handleError(e, reply));
    }
  },
  {
    method: 'GET',
    path: '/api/results/{runId}/{fileName?}',
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
  }
];
