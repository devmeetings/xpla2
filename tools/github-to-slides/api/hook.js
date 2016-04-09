'use strict';

const generate = require('./generate');

module.exports = function (ghdata) {
  let refPattern = /^refs\/heads\/(.+)$/;
  let match = refPattern.exec(ghdata.ref);

  if (!match) {
    return Promise.resolve('Ref pattern doesn\'t match');
  }

  let repo = ghdata.repository.name;
  let username = ghdata.repository.owner.name;
  let branch = match[1];

  if (branch === 'gh-pages') {
    return Promise.resolve('Ignoring gh-pages.');
  }
  return generate(username, repo, branch);
};
