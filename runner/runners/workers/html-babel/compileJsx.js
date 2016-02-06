const babel = require('babel-core');

const _ = require('lodash');
const buildErrorsPage = require('../html-ts/buildErrorsPage');

module.exports = function compileJsx (code) {
  const inFiles = _.values(code.files);
  const output = transpileJsxFiles(inFiles);
  const files = inFiles.concat(output.files);

  if (output.errors.length) {
    return {
      success: false,
      files: files.concat([
        {
          name: 'index.html',
          content: buildErrorsPage(output.errors),
          mimetype: 'text/html'
        }
      ])
    };
  }

  return {
    success: true,
    files: files
  };
};

function preset (presetName) {
  return __dirname + `/node_modules/babel-preset-${presetName}`;
}

function transpileJsxFiles (files) {
  const JSX_PATTERN = /\.jsx?$/i;
  const filesToTranspile = files.filter((file) => {
    return JSX_PATTERN.test(file.name);
  });

  const transpiledFiles = filesToTranspile.map((file) => {
    try {
      const trans = babel.transform(file.content, {
        filename: file.name,
        presets: [preset('react'), preset('es2015'), preset('stage-0')],
        sourceRoot: __dirname,
        sourceMaps: 'inline'
      });
      return {
        name: file.name.replace(JSX_PATTERN, '.js'),
        content: trans.code,
        mimetype: 'application/javascript'
      };
    } catch (e) {
      console.error(e);
      return {
        name: file.name,
        error: e
      };
    }
  });

  const errors = transpiledFiles
    .filter((file) => file.error)
    .map((file) => ({
      filePath: file.name,
      startPos: file.error.loc || {
        line: 0,
        col: 0
      },
      message: file.error.toString(),
      preview: ''
    }));

  return {
    errors,
    files: transpiledFiles.filter((file) => !file.error)
  };
}
