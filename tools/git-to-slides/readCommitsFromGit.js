const Git = require('nodegit');
const _ = require('lodash');

const ignore = [
  '.editorconfig',
  '.gitignore'
];

module.exports = function readCommitsFromGit(dir) {
  return new Promise((resolve, reject) => {
     Git.Repository.open(dir)
      .then((repo) => repo.getHeadCommit())
      .then((head) => {
        console.log('Head', head.message());
        const history = head.history(Git.Revwalk.SORT.REVERSE);

        const commits = [];
        history.on('commit', (commit) => {
          commits.push(
            readCommit(commit).catch(reject)
          );
        });

        history.on('end', () => {
          Promise.all(commits).then(resolve, reject)
        });

        history.start();
      })
      .catch(reject);
  });
};

function readCommit (commit) {
  console.log('Reading commit', commit.message());
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
        newFiles: removeIgnoredFiles(newFiles),
        oldFiles: removeIgnoredFiles(oldFiles),
        message: commit.message()
      };
    });
  });
}

function removeIgnoredFiles (files) {
  return files.filter((file) => !_.contains(ignore, file.path));
}

function getOldFiles (tree, newFiles) {
  const oldFiles = tree.entries()
    .filter((entry) => entry.isFile())
    .filter((entry) => !_.find(newFiles, (file) => file.path === entry.path()))
    .map((entry) => {
      return entry.getBlob().then((blob) => {
        return {
          path: entry.path(),
          lines: [],
          content: blob.content().toString()
        };
      });
    });
  return Promise.all(oldFiles);
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
  return Promise.all(hunks.map((hunk) => hunk.lines()))
    .then((hunkLines) => {
      const lines = _.flatten(hunkLines);
      return lines
        .filter((line) => line.numLines() !== 0) // ?
        .filter((line) => line.newLineno() > -1) // removed lines
        .map((line) => {
          return {
            lineNo: line.newLineno(),
            numLines: line.numLines()
          };
        })
        .reduce(convertLinesToRanges, []);
    });
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
      content: data.blob.content().toString()
    };
  });
}
