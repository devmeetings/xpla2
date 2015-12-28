const _ = require('lodash');
const runs = require('../storage/runs');

const DEFAULT_FILES = [
  'index.html',
  'index.htm',
  'index.json'
];

function getFile (data) {
  return runs.retrieve(data.runId).then((runData) => {
    const files = runData.files;
    const fileName = data.fileName;

    if (!files[fileName]) {
      // Check default files
      const f = _.find(DEFAULT_FILES, (f) => files[f]);
      if (!f) {
        const e = new Error('File not found');
        e.code = 404;
        throw e;
      }
      return files[f];
    }

    return files[fileName];
  });
}

module.exports = {
  getFile
};

