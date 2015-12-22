const commits = require('./code/commits');

function getFile (data) {
  return commits.retrieve(data.commitId).then((commitData) => {
    const files = commitData.files;
    const fileName = data.fileName;

    if (!files[fileName]) {
      const e = new Error('File not found');
      e.code = 404;
      throw e;
    }

    return files[fileName];
  });
}

module.exports = {
  getFile
};

