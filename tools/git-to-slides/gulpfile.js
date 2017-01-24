"use strict";

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


function generateSlides(source, target) {
  return generator.readCommitsFromGit(source, ['current'], [])
    .then(generator.convertCommitsToSlidesContent)
    .then(generator.saveSlides.bind(null, {
      output: target,
      runner: 'html',
      runServer: generator.DEFAULT_RUN_SERVER,
      resourceUrl: generator.DEFAULT_RESOURCE_URL,
      version: generator.DEFAULT_SOFTWARE_VERSION
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
