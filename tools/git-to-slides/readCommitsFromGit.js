'use strict';

const Git = require('nodegit');
const _ = require('lodash');

const IGNORE = [
  '.editorconfig',
  '.gitignore'
];

module.exports = function readCommitsFromGit (dir, branches, ignore) {
  const ignored = ignore.concat(IGNORE);

  return Git.Repository.open(dir)
    .then(repo => {
      if (branches.length === 1 && branches[0].name === 'current=Current') {
        return repo.getHeadCommit()
          .then(head => processCommit(head, ignored))
          .then(commits => ({
            current: commits
          }));
      }

      const branches2 = Promise.all(branches.map(branch => {
        console.log(branch)
        const split = branch.name.split('=');
        return Git.Branch.lookup(repo, split[0], Git.Branch.BRANCH.ALL)
          .then(ref => ({
            branch: ref,
            name: branch.name
          }));
      }));

      return branches2.then(branches => branches.reduce((previous, { branch, name }) => {
        return previous.then(allCommits => {
          console.log('Processing branch: ', name);
          return repo.getCommit(branch.target())
            .then(head => processCommit(head, ignored))
            .then(commits => {
              allCommits[name] = commits;
              return allCommits;
            });
        });
      }, Promise.resolve({})));
    });
};

function processCommit (head, ignored) {
  return new Promise((resolve, reject) => {
    console.log('Head', head.message().replace(/\s+$/g, ''));
    const history = head.history(Git.Revwalk.SORT.REVERSE);

    const commits = [];
    history.on('commit', (commit) => {
      commits.push(
        readCommit(commit, ignored).catch(reject)
      );
    });

    history.on('end', (a) => {
      Promise.all(commits).then(resolve, reject);
    });

    history.start();
  });
}

function readCommit (commit, ignore) {
  console.log('Reading commit', commit.message().replace(/\s+$/g, ''));
  const treePromise = commit.getTree();
  const diffPromise = commit.getDiff();

  return Promise.all([treePromise, diffPromise]).then((data) => {
    const tree = data[0];
    const diffs = data[1];
    return parseDiffsToFiles(commit, diffs, tree).then((newFiles) => ({
      newFiles,
      tree
    }));
  }).then((data) => {
    const tree = data.tree;
    const newFiles = data.newFiles;

    return getOldFiles(tree, newFiles).then((oldFiles) => {
      return {
        newFiles: removeIgnoredFiles(newFiles, ignore),
        oldFiles: removeIgnoredFiles(oldFiles, ignore),
        message: commit.message()
      };
    });
  });
}

function removeIgnoredFiles (files, ignore) {
  return files.filter((file) => !_.includes(ignore, file.path));
}

function getAllFileEntries (tree) {
  const entries = tree.entries()
    .filter((entry) => entry.isFile());

  const p = Promise.all(
    tree.entries()
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.getTree().then((tree) => getAllFileEntries(tree)))
  );
  return p.then((direntries) => {
    return direntries.reduce((memo, direntry) => {
      return memo.concat(direntry);
    }, entries);
  });
}

function getOldFiles (tree, newFiles) {
  return getAllFileEntries(tree).then((entries) => {
    const oldFiles = entries
      .filter((entry) => !_.find(newFiles, (file) => file.path === entry.path()))
      .map((entry) => {
        return entry.getBlob().then((blob) => {
          return {
            path: entry.path(),
            lines: [],
            content: blob.content().toString(),
            rawContent: blob.content()
          };
        });
      });
    return Promise.all(oldFiles);
  });
}

function parseDiffsToFiles (commit, diffs, tree) {
  return Promise.all(diffs.map((diff) => {
    return diff.patches().then((patches) => {
      return Promise.all(patches
        .filter((patch) => !patch.isDeleted())
        .map((patch) => {
          return parsePatch(commit, patch, tree);
        })
      );
    });
  })).then((diffsWithFiles) => {
    return _.flatten(diffsWithFiles);
  });
}

function convertHunksToLines (hunks) {
  return Promise.all(hunks.map((hunk) => {
    return {
      lineNo: hunk.newStart(),
      numLines: hunk.newLines()
    };
  }).reduce(convertLinesToRanges, []));
}

function convertLinesToRanges (memo, line) {
  const last = _.last(memo);
  // check if current range can be continued
  if (last && last.lineNo + last.numLines === line.lineNo) {
    last.numLines += line.numLines;
    return memo;
  }
  // just add new range
  memo.push(line);
  return memo;
}

function parsePatch (commit, patch, tree) {
  const newFilePath = patch.newFile().path();

  const entryBlobPromise = tree
    .getEntry(newFilePath)
    .then((treeEntry) => treeEntry.getBlob());
  const linesPromise = patch
    .hunks()
    .then(convertHunksToLines);

  return entryBlobPromise.then((blob) => {
    return linesPromise.then((lines) => {
      return {
        lines, blob
      };
    });
  }).then((data) => {
    return {
      path: newFilePath,
      lines: data.lines,
      content: data.blob.content().toString(),
      rawContent: data.blob.content()
    };
  });
}
