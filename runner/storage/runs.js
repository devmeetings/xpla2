const uuid = require('node-uuid');

const mem = {};

function store (runData) {
  const runId = uuid.v1();
  mem[runId] = runData;

  return Promise.resolve(runId);
}

function retrieve (runId) {
  const runData = mem[runId];
  if (runData) {
    return Promise.resolve(runData);
  }
  const e = new Error(`No data for run ${runId}`);
  e.code = 404;
  return Promise.reject(e);
}

module.exports = {
  store, retrieve
};
