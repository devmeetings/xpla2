'use strict';

const fs = require('fs.promised');
const path = require('path');
const glob = require('glob');

const IGNORE = [
  '.editorconfig',
  '.gitignore',
  '.git'
];

module.exports = function readSlidesFromDir (dir, branches, ignore) {
  const ignored = ignore.concat(IGNORE);

  return fs.readdir(dir)
    .then(files => {
      files = files.filter(name => ignored.indexOf(name) === -1);
      const dirs = getDirs(dir, files, branches);
      console.log('Directories', dirs.map(dir => dir.name));

      return Promise.all(dirs.map(dir => readFiles(dir, ignored)));
    })
    .then(dirsWithFiles => {
      return dirsWithFiles.map(dirObject => {
        return {
          newFiles: dirObject.files,
          oldFiles: [],
          message: dirObject.title,
          branch: dirObject.branch
        };
      });
    })
    .then(dirsAsCommits => {
      return dirsAsCommits.reduce((memo, dir) => {
        memo[dir.branch] = [dir];
        return memo;
      }, {});
    });
};

function getDirs (dir, files, branches) {
  if (branches[0] === 'current=Current' && branches.length === 1) {
    // Take all directories by default
    return files
      .filter(file => fs.statSync(path.join(dir, file)).isDirectory())
      .map(file => ({
        name: file,
        title: file,
        description: '',
        branch: `${file}`,
        path: path.join(dir, file)
      }));
  }

  return branches
    .map(branch => {
      const [name, title, description] = branch.split('=');
      return {
        name,
        title,
        description,
        branch,
        path: path.join(dir, name)
      };
    })
    .filter(d => {
      if (files.indexOf(d.name) === -1) {
        console.warn(`Igorning ${d.name}, could not find in ${files}`);
        return false;
      }

      return true;
    });
}

function readFiles (dirObject, ignore) {
  return new Promise(
    (resolve, reject) => {
      glob(path.join(dirObject.path, '**'), {
        ignore
      }, (err, files) => {
        if (err) {
          return reject(err);
        }
        return resolve(files);
      });
    })
    .then(files => {
      return Promise.all(files
        .filter(file => fs.statSync(file).isFile())
        .map(file => {
          return fs.readFile(file, 'utf8').then(content => {
            return {
              path: path.relative(dirObject.path, file),
              lines: [{
                lineNo: 0,
                numLines: content.split('\n').length
              }],
              content: content,
              rawContent: content
            };
          });
        })
      );
    })
    .then(files => {
      dirObject.files = files;
      return dirObject;
    });
}
