const html = require('./workers/html');
const java = require('./workers/java');

function getRunner (runnerName) {
  return {
    html, java
  }[runnerName];
}

module.exports = {
  getRunner
};
