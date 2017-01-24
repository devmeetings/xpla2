'use strict';

const spawn = require('child_process').spawn;

module.exports = function (user, repo, branch) {
  return new Promise((resolve, reject) => {
    const proc = spawn('./run.sh', [user, repo, branch], {
      cwd: __dirname
    });

    let output = '';

    proc.stdout.on('data', (data) => {
      output += data;
    });

    proc.stderr.on('data', (data) => {
      output += data;
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        resolve(output);
        return;
      }

      reject({
        code: 401,
        toString () {
          return output;
        }
      });
    });
  });
};
