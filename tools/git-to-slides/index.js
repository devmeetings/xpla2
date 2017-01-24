#!/usr/bin/env node

"use strict";

const program = require('commander');
const readCommitsFromGit = require('./readCommitsFromGit');
const convertCommitsToSlidesContent = require('./commitsToSlides');
const saveSlides = require('./saveSlides');

const DEFAULT_OUTPUT = 'slides';
const DEFAULT_RUNNER = 'html';
const DEFAULT_RUN_SERVER = 'https://xpla.org';
const DEFAULT_RESOURCE_URL = 'https://xpla.org/static';
const DEFAULT_SOFTWARE_VERSION = '3.0.0';

if (require.main === module) {
  program
    .version(require('./package.json').version)
    .option(
      '-b, --branches <branches>',
      'Semicolon separated list of branches, fullname can be supplied after = [current=Current]',
      val => val.split(';'), ['current=Current']
    )
    .option('-n, --name [name]', `Workshop name [Workshop]`, 'Workshop')
    .option('-d, --date [date]', 'Workshop date and location []', '')
    .option('-l, --link [link]', 'Short link for the workshop []', '')
    .option('-r, --runner [runner]', `Runner type [${DEFAULT_RUNNER}]`, DEFAULT_RUNNER)
    .option('-s, --run-server [url]', `Run server url, [${DEFAULT_RUN_SERVER}]`, DEFAULT_RUN_SERVER)
    .option('-o, --output [dir]', `Output directory [${DEFAULT_OUTPUT}]`, DEFAULT_OUTPUT)
    .option('-i, --ignore <patterns>', 'Comma separated list of filenames to ignore, []', val => val.split(','), [])
    .parse(process.argv);

  readCommitsFromGit(process.cwd(), program.branches, program.ignore)
    .then(x => {
      console.log(x);
      return x;
    })
    .then(convertCommitsToSlidesContent)
    .then(saveSlides.bind(null, {
      output: program.output,
      runner: program.runner,
      runServer: program.runServer,
      resourceUrl: DEFAULT_RESOURCE_URL,
      version: DEFAULT_SOFTWARE_VERSION,
      name: program.name,
      date: program.date,
      link: program.link
    }))
    .catch(rethrow);
}

function rethrow (err) {
  console.error(err);
  setTimeout(() => {
    throw err;
  });
}

module.exports = {
  readCommitsFromGit,
  convertCommitsToSlidesContent,
  saveSlides,
  DEFAULT_RUN_SERVER,
  DEFAULT_RESOURCE_URL,
  DEFAULT_SOFTWARE_VERSION,
  rethrow
};
