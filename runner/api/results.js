const _ = require('lodash');
const runs = require('../storage/runs');

const DEFAULT_FILES = [
  'index.html',
  'index.htm',
  'index.json'
];

function getFile (data) {
  'use strict';

  return runs.retrieve(data.runId).then((runData) => {
    const files = runData.files;
    let fileName = data.fileName;

    if (!fileName) {
      // Check default files
      const f = _.find(DEFAULT_FILES, (f) => files[f]);
      fileName = f;
    }

    if (!fileName || !files[fileName]) {
      const e = new Error('File not found');
      e.code = 404;
      throw e;
    }

    return files[fileName];
  });
}

function getRaw (data) {
  const field = data.field;

  return runs.retrieve(data.runId).then((runData) => {
    if (!field) {
      return runData;
    }
    return {
      [field]: runData[field]
    };
  });
}

module.exports = {
  getFile, getRaw
};

