'use strict';

const uuid = require('uuid');
const db = require('./db');

const mem = db();

function store (code) {
  const commitId = code.hash || uuid.v1();
  mem.store(commitId, code);

  return Promise.resolve(commitId);
}

function retrieve (commitId) {
  const commitData = mem.retrieve(commitId);
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
