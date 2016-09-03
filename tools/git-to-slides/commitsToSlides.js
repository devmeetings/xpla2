"use strict";

const _ = require('lodash');

const ANNOTATIONS_FILE = '_annotations.html';
const TASKS_FILE = '_tasks.html';
const XP_TREE_FILE = '_xp-tree';
const XP_NO_HIGHLIGHT_FILE = '_xp-no-highlight';
const XP_RUNNER_FILE = '_xp-runner';
const XP_PREVIEW_FILE = '_xp-preview-file';
const XP_NO_PREVIEW = '_xp-no-preview';

const SPECIAL_FILES = [
  ANNOTATIONS_FILE, XP_TREE_FILE, XP_NO_HIGHLIGHT_FILE, XP_RUNNER_FILE, XP_PREVIEW_FILE, XP_NO_PREVIEW, TASKS_FILE
];

module.exports = convertCommitsToSlidesContent;

function editorFilePath (slideName, file) {
  return `${slideName}/${file.path}`;
}

function convertCommitsToSlidesContent (commits) {
  return commits.reduce((slidesContent, commit, idx) => {
    // printCommit(commit);

    const slideNo = idx + 1;
    const slideName = withLeadingZeros(slideNo);

    const oldFiles = commit.oldFiles
      .filter((file) => SPECIAL_FILES.indexOf(file.path) === -1);

    const hasOldFiles = oldFiles.length;

    const newFiles = commit.newFiles
      .filter((file) => SPECIAL_FILES.indexOf(file.path) === -1);

    const filesToSave = newFiles
      .map((file) => {
        return {
          path: editorFilePath(slideName, file),
          content: file.content
        };
      });

    const noHighlight = getFile(commit.newFiles, XP_NO_HIGHLIGHT_FILE, '').split('\n');
    const editors = newFiles.map((file) => {
      const highlights = noHighlight.indexOf(file.path) === -1 ? linesToHighlights(file.lines) : '';

      return {
        id: file.path,
        highlight: highlights,
        src: editorFilePath(slideName, file)
      };
    });

    if (hasOldFiles) {
      // reuse old editors
      const lastSlide = _.last(slidesContent);
      editors.push.apply(editors, oldFiles.map((file) => {
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

    const msg = splitToTitleAndComment(commit.message);
    const allFiles = commit.newFiles.concat(commit.oldFiles);
    const annotations = getFile(commit.newFiles, ANNOTATIONS_FILE, '');
    const tasks = getFile(commit.newFiles, TASKS_FILE, false);
    const displayTree = hasFile(allFiles, XP_TREE_FILE);
    const displayPreview = !hasFile(allFiles, XP_NO_PREVIEW);
    const runner = getFile(allFiles, XP_RUNNER_FILE, false);
    const preview = getFile(allFiles, XP_PREVIEW_FILE, false);

    const active = editors.length ? editors[0].id : undefined;

    // Push a slide if there are no tasks or more then one file is inside the commit.
    if (!tasks || commit.newFiles > 1) {
      slidesContent.push({
        filesToSave,
        active,
        editors,
        slideName,
        annotations,
        displayTree,
        displayPreview,
        runner,
        preview,
        title: msg.title,
        comment: msg.comment
      });
    }

    if (tasks) {
      slidesContent.push({
        slideName,
        tasks,
        active,
        editors,
        title: msg.title,
        comment: msg.comment,
        filesToSave: [],
      });
    }

    return slidesContent;
  }, []);
}

function getFile(newFiles, fileName, defaultVal) {
  const file = newFiles.filter((file) => file.path === fileName)[0];
  if (!file) {
    return defaultVal;
  }
  return file.content;
}

function hasFile(newFiles, fileName) {
  const file = newFiles.filter((file) => file.path === fileName)[0];
  return !!file;
}

function splitToTitleAndComment(message) {
  const PATTERN = /(.+) \[(.+)\]/;
  const match = message.match(PATTERN);
  if (match) {
    return {
      title: match[2],
      comment: match[1]
    };
  }
  return {
    title: message,
    comment: message
  };
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
