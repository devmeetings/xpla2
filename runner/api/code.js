'use strict';

const _ = require('lodash');
const commits = require('../storage/commits');
const runs = require('../storage/runs');
const runners = require('../runners/workers');
const mimetypes = require('mime-types');

const crypto = require('crypto');

function addMimetype (file) {
  const defaultMime = 'application/octet-stream';
  file.mimetype = mimetypes.lookup(file.name) || defaultMime;
  return file;
}

function commitCode (data) {
  const hash = crypto.createHash('md5');
  const files = _.chain(data.files)
    .map(addMimetype)
    .map(file => {
      hash.update(file.content);
      return file;
    })
    .indexBy('name')
    .value();

  return commits.store({
    hash: hash.digest('hex'),
    files
  }).then((commitId) => ({
    commitId
  }));
}

function runCode (data) {
  const runnerName = data.runnerName;
  const commitId = data.commitId;
  const skipCache = data.skipCache;
  let runId = null;

  return commits.retrieve(commitId).then((commitData) => {
    let cacheId = skipCache ? null : `${runnerName}_${commitData.hash}`;
    return runs.retrieve(cacheId).then(cacheData => {
      return {
        runId: cacheId
      };
    }, () => {
      const runner = runners.getRunner(runnerName);
      return runner(commitData, (runData) => {
        runs.update(runId, runData);
      }).then((runData) => {
        return runs.store(runData, cacheId);
      }).then((newRunId) => {
        runId = newRunId;
        return {
          runId
        };
      });
    });
  });
}

function commitAndRunCode (data) {
  return commitCode(data).then((res) => {
    return runCode({
      commitId: res.commitId,
      runnerName: data.runnerName,
      skipCache: data.skipCache
    });
  });
}

module.exports = {
  commitCode, runCode, commitAndRunCode
};
