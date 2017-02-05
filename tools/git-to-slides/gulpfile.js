'use strict';

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const watch = require('gulp-watch');
const server = require('gulp-server-livereload');
const del = require('del');

const generator = require('./index.js');

const slidesDir = process.cwd() + '/slides/';

let sourceDir = process.argv[3];
if (!sourceDir || process.argv[2] !== '--dir') {
  throw new Error('You need to provide path to the repository. `npm start <dir>`');
}

function generateSlides (source, target) {
  const config = generator.readConfigFile(source, fs.existsSync(path.join(source, 'xpla.json')), {
    branches: ['current=Current'],
    ignore: [],
    name: 'Devmeeting',
  });

  return (config.fromDirs
      ? generator.readCommitsFromDir(source, config.branches, config.ignore)
      : generator.readCommitsFromGit(source, config.branches, config.ignore)
    )
    .then(generator.convertCommitsToSlidesContent)
    .then(generator.saveSlides.bind(null, {
      output: target,
      runner: config.runner,
      runServer: config.runServer || generator.DEFAULT_RUN_SERVER,
      resourceUrl: generator.DEFAULT_RESOURCE_URL,
      version: generator.DEFAULT_SOFTWARE_VERSION,
      name: config.name,
      date: config.date,
      link: config.link
    }))
    .catch(generator.rethrow);
}

gulp.task('clean', function () {
  return del([slidesDir]);
});

gulp.task('serve', ['clean'], function () {
  watch([`${sourceDir}/**/*`], function () {
    return generateSlides(sourceDir, slidesDir);
  });

  generateSlides(sourceDir, slidesDir).then(() => {
    gulp.src(slidesDir)
    .pipe(server({
      livereload: true,
      open: true
    }));
  });
});

gulp.task('default', ['serve']);
