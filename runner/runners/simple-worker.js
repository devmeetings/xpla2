const worker = require('./remote-worker');

module.exports = function createWorker (queueName) {
  return function (data) {
    return worker.send(queueName, data).then((outputData) => {
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
    }, (err) => {
      if (err.isTimeout) {
        err.code = 503;
      }
      throw err;
    });
  };
};

function getResultsAsHtml (data) {
  if (data.success) {
    return `<pre>${data.result.join('\n')}</pre>`;
  }
  return `<div style="color: red">
    <pre>${data.errors.join('\n')}</pre>
  </div>`;
}

