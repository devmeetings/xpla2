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
        `,
        mimetype: 'text/html'
      }
    ];

    return {
      success: outputData.success,
      files: newFiles
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
