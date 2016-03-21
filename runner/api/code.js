'use strict';

const _ = require('lodash');
const commits = require('../storage/commits');
const runs = require('../storage/runs');
const runners = require('../runners/workers');
const mimetypes = require('mime-types');

function addMimetype (file) {
  const defaultMime = 'application/octet-stream';
  file.mimetype = mimetypes.lookup(file.name) || defaultMime;
  return file;
}

function commitCode (data) {
  const files = _.chain(data.files)
    .map(addMimetype)
    .indexBy('name')
    .value();

  return commits.store({
    files
  }).then((commitId) => ({
    commitId
  }));
}

function runCode (data) {
  const runnerName = data.runnerName;
  const commitId = data.commitId;
  let runId = null;

  return commits.retrieve(commitId).then((commitData) => {
    const runner = runners.getRunner(runnerName);
    return runner(commitData, (runData) => {
      runs.update(runId, runData);
    });
  }).then((runData) => {
    return runs.store(runData);
  }).then((newRunId) => {
    runId = newRunId;
    return {
      runId
    };
  });
}

function commitAndRunCode (data) {
  return commitCode(data).then((res) => {
    return runCode({
      commitId: res.commitId,
      runnerName: data.runnerName
    });
  });
}

module.exports = {
  commitCode, runCode, commitAndRunCode
};
