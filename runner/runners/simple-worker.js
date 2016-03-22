const worker = require('./remote-worker');

module.exports = function createWorker (queueName) {
  return function (data, onUpdate) {
    const onData = (outputData) => {
      const timestamp = Date.now();

      const newFiles = [
        {
          name: 'index.html',
          content: `
            <html>
              <head>
              </head>
              <body>
              ${getResultsAsHtml(outputData)}
              <script src="/cdn/fetch/0.9.0/fetch.min.js"></script>
              <script>
                (function() {
                  var currentTimestamp = ${timestamp};
                  var loc = "" + window.location;
                  var check = loc.replace(/^(.+)\\/.*$/, '$1.json/timestamp');
                  var noOfChecks = 50;

                  function checkNewVersion() {
                    fetch(check).then(function (res) {
                      return res.json();
                    }).then(function(timestamp) {
                      if (timestamp.timestamp !== currentTimestamp) {
                        window.location.reload();
                      }

                      if (noOfChecks > 0) {
                        noOfChecks--;
                        setTimeout(checkNewVersion, 700 + (200 - noOfChecks * 4));
                      }
                    }, function () {
                      setTimeout(checkNewVersion, 2000);
                    });
                  }

                  setTimeout(checkNewVersion, 200);
                }());
              </script>
              </body>
            </html>
          `,
          mimetype: 'text/html'
        }
      ];

      return {
        success: outputData.success,
        timestamp: timestamp,
        files: newFiles
      };
    };

    return worker.send(queueName, data, function (data) {
      onUpdate(onData(data));
    }).then(onData, (err) => {
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
    <h3>Output:</h3>
    <pre>${data.result.join('\n')}</pre>
  </div>`;
}

