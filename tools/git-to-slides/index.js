#!/usr/bin/env node

const _ = require('lodash');
const readCommitsFromGit = require('./readCommitsFromGit');
const saveSlides = require('./saveSlides');

readCommitsFromGit(process.cwd())
  .then(convertCommitsToSlidesContent)
  .then(saveSlides)
  .catch(rethrow);

function editorFilePath (slideName, file) {
  return `${slideName}/${file.path}`;
}

function convertCommitsToSlidesContent (commits) {
  return commits.reduce((slidesContent, commit, idx) => {
    // printCommit(commit);

    const slideNo = idx + 1;
    const slideName = withLeadingZeros(slideNo);

    const hasOldFiles = commit.oldFiles.length;

    const filesToSave = commit.newFiles.map((file) => {
      return {
        path: editorFilePath(slideName, file),
        content: file.content
      };
    });

    const editors = commit.newFiles.map((file) => {
      const highlights = hasOldFiles ? linesToHighlights(file.lines) : [];
      return {
        id: file.path,
        highlight: highlights,
        src: editorFilePath(slideName, file)
      };
    });

    if (hasOldFiles) {
      // reuse old editors
      const lastSlide = _.last(slidesContent);
      editors.push.apply(editors, commit.oldFiles.map((file) => {
        const oldEditor = lastSlide.editors.find((editor) => {
          return editor.id === file.path;
        });
        return {
          id: file.path,
          highlight: '',
          src: oldEditor.src
        };
      }));
    }

    const active = editors[0];
    slidesContent.push({
      filesToSave,
      active,
      editors,
      slideName,
      title: commit.message
    });

    return slidesContent;
  }, []);
}

function withLeadingZeros (num) {
  const n = `${num}`;
  return _.padLeft(n, 3, '0');
}

function linesToHighlights (lines) {
  return lines.map((line) => {
    const max = line.lineNo + line.numLines - 1;
    if (max === line.lineNo) {
      return `${max}`;
    }
    return `${line.lineNo}-${max}`;
  }).join(',');
}

function printCommit (commit) {
    const printFile = (file) => {
      const c = _.clone(file);
      delete c.content;
      c.lines = JSON.stringify(file.lines);
      return c;
    };
    console.log('New:', commit.newFiles.map(printFile));
    console.log('Old:', commit.oldFiles.map(printFile));
    console.log(commit.message + '\n');
}

function rethrow (err) {
  setTimeout(() => {
    throw err;
  });
}
