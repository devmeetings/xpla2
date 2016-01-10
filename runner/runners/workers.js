const _ = require('lodash');

const html = require('./workers/html');
const java = require('./workers/java');
const htmlTs = require('./workers/html-ts');
const htmlJsx = require('./workers/html-jsx');
const burger = require('./workers/burger');
const python = require('./workers/python');
const node = require('./workers/node');

const runners = {
  html, java, burger, python, node,
  'html-jsx': htmlJsx,
  'html-ts': htmlTs
};

function getRunner (runnerName) {
  return (code) => {
    const r = runners[runnerName](code);

    const oldFiles = _.values(code.files).map((file) => {
      const newFile = _.clone(file);
      newFile.name = 'src/' + file.name;
      return newFile;
    });

    // Add original files to result
    return Promise.resolve(r).then((output) => {
      output.files = _.indexBy(
        output.files.concat(oldFiles),
        'name'
      );
      return output;
    });
  };
}

module.exports = {
  getRunner,
  runners
};
