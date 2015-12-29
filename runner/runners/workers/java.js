const worker = require('../remote-worker');
const _ = require('lodash');

module.exports = function (data) {
  return worker.send('exec_java', data).then((outputData) => {
    const newFiles = [
      {
        name: 'index.html',
        content: `
          <html>
            <head>
            </head>
            <body>
            ${getResultsAsHtml(outputData)}
            </body>
          </html>
        `
      }
    ];

    const oldFiles = _.values(data.files).map((file) => {
      file.name = 'src/' + file.name;
      return file;
    });

    return {
      success: outputData.success,
      files: _.chain(
          newFiles.concat(oldFiles)
        )
        .indexBy('name')
        .value()
    };
  });
};

function getResultsAsHtml (data) {
  if (data.success) {
    return `<pre>${data.result.join('\n')}</pre>`;
  }
  return `<div style="color: red">
    <pre>${data.errors.join('\n')}</pre>
  </div>`;
}
