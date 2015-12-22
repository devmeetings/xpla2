const uuid = require('node-uuid');

const mem = {};

function store (code) {
  const commitId = uuid.v1();
  mem[commitId] = code;

  return Promise.resolve(commitId);
}

function retrieve (commitId) {
  const commitData = mem[commitId];
  if (commitData) {
    return Promise.resolve(commitData);
  }
  const e = new Error(`No data for commit ${commitId}`);
  e.code = 404;
  return Promise.reject(e);
}

module.exports = {
  store, retrieve
};
