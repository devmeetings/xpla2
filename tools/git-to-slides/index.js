#!/usr/bin/env node

const program = require('commander');
const readCommitsFromGit = require('./readCommitsFromGit');
const convertCommitsToSlidesContent = require('./commitsToSlides');
const saveSlides = require('./saveSlides');

const DEFAULT_OUTPUT = 'slides';
const DEFAULT_RUNNER = 'html';
const DEFAULT_RUN_SERVER = 'https://xpla.org';
const DEFAULT_RESOURCE_URL = 'https://xpla.org/static';
const DEFAULT_SOFTWARE_VERSION = '3.0.0';

program
  .version(require('./package.json').version)
  .option('-r, --runner [runner]', `Runner type [${DEFAULT_RUNNER}]`, DEFAULT_RUNNER)
  .option('-s, --run-server [url]', `Run server url, [${DEFAULT_RUN_SERVER}]`, DEFAULT_RUN_SERVER)
  .option('-o, --output [dir]', `Output directory [${DEFAULT_OUTPUT}]`, DEFAULT_OUTPUT)
  .option('-i, --ignore <patterns>', 'Comma separated list of filenames to ignore, []', function (val) {
    return val.split(',');
  }, [])
  .parse(process.argv);

readCommitsFromGit(process.cwd(), program.ignore)
  .then(convertCommitsToSlidesContent)
  .then(saveSlides.bind(null, {
    output: program.output,
    runner: program.runner,
    runServer: program.runServer,
    resourceUrl: DEFAULT_RESOURCE_URL,
    version: DEFAULT_SOFTWARE_VERSION
  }))
  .catch(rethrow);


function rethrow (err) {
  setTimeout(() => {
    throw err;
  });
}

