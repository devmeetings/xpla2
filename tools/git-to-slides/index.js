#!/usr/bin/env node

const readCommitsFromGit = require('./readCommitsFromGit');

readCommitsFromGit(process.cwd())
  .then(processCommits)
  .catch(rethrow);


function processCommits (commits) {
  commits.map((commit) => {
      const printFile = (file) => {
      delete file.content;
        file.lines = JSON.stringify(file.lines);
        return file;
      };
      console.log('New:', commit.newFiles.map(printFile));
      console.log('Old:', commit.oldFiles.map(printFile));
      console.log(commit.message + '\n');
  });
}

function rethrow (err) {
  setTimeout(() => {
    throw err;
  });
}
