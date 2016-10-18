'use strict';

const uuid = require('node-uuid');
const db = require('./db');

const mem = db();

function store (runData, cacheId) {
  const runId = cacheId || uuid.v1();
  mem.store(runId, runData);
  return Promise.resolve(runId);
}

function update (runId, runData) {
  mem.store(runId, runData);
}

function retrieve (runId) {
  const runData = mem.retrieve(runId);
  if (runData) {
    return Promise.resolve(runData);
  }
  const e = new Error(`No data for run ${runId}`);
  e.code = 404;
  return Promise.reject(e);
}

module.exports = {
  store, retrieve, update
};
