const _ = require('lodash');
const commits = require('./commits');
const runners = require('../../runners/runners');
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

  return commits.retrieve(commitId).then((commitData) => {
    const runner = runners.getRunner(runnerName);
    return runner(commitData);
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
