'use strict';

const db = require('./db');

const mem = db();

function store (origin, data) {
  mem.store(origin, data);

  return Promise.resolve(origin);
}

function getAll () {
  const data = {};
  mem.keys().forEach(key => {
    data[key] = mem.retrieve(key);
  });
  return Promise.resolve(data);
}

function retrieve (origin) {
  const data = mem.retrieve(origin);
  if (data) {
    return Promise.resolve(data);
  }

  const e = new Error(`No data for origin ${origin}`);
  e.code = 404;
  return Promise.reject(e);
}

module.exports = {
  store, retrieve, getAll
};
