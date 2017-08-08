const _ = require('lodash');

const html = require('./workers/html');
const java = require('./workers/java');
const htmlTs = require('./workers/html-ts');
const htmlJsx = require('./workers/html-babel');
const burger = require('./workers/burger');
const python = require('./workers/python');
const node = require('./workers/node');
const go = require('./workers/go');
const webpack = require('./workers/webpack');
const dart = require('./workers/dart');
const elm = require('./workers/elm');
const react = require('./workers/react');
const express = require('./workers/express');
const angularCli = require('./workers/angularCli');

const runners = {
  html,
  java,
  burger,
  python,
  node,
  go,
  webpack,
  dart,
  elm,
  react,
  express,
  'html-jsx': htmlJsx,
  'html-babel': htmlJsx,
  'html-ts': htmlTs,
  'angular-cli': angularCli
};

function getRunner (runnerName) {
  return (code, onUpdate) => {
    const r = runners[runnerName](code, (output) => {
      return onUpdate(addOriginalFiles(output));
    });

    const oldFiles = _.values(code.files).map((file) => {
      const newFile = _.clone(file);
      newFile.name = 'src/' + file.name;
      return newFile;
    });

    function addOriginalFiles (output) {
      output.files = _.keyBy(
        output.files.concat(oldFiles),
        'name'
      );
      return output;
    }

    // Add original files to result
    return Promise.resolve(r).then(addOriginalFiles);
  };
}

module.exports = {
  getRunner,
  runners
};
