#!/usr/bin/env node

'use strict';

const path = require('path');
const dateformat = require('dateformat');
const program = require('commander');

const readCommitsFromGit = require('./readCommitsFromGit');
const readCommitsFromDir = require('./readCommitsFromDir');
const convertCommitsToSlidesContent = require('./commitsToSlides');
const saveSlides = require('./saveSlides');
const validateConfig = require('./config');

const DEFAULT_OUTPUT = 'slides';
const DEFAULT_RUNNER = 'auto';
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
    .option('-c, --config [config]', 'Attempt to read config file [xpla.json]', false)
    .option('-f, --from-dirs', 'Generate slides from directories instead of git history.', false)
    .option('-n, --name [name]', `Workshop name [Devmeeting]`, 'Devmeeting')
    .option('-d, --date [date]', 'Workshop date and location []', '')
    .option('-l, --link [link]', 'Short link for the workshop []', '')
    .option('-r, --runner [runner]', `Runner type [${DEFAULT_RUNNER}]`, DEFAULT_RUNNER)
    .option('-s, --run-server [url]', `Run server url, [${DEFAULT_RUN_SERVER}]`, DEFAULT_RUN_SERVER)
    .option('-o, --output [dir]', `Output directory [${DEFAULT_OUTPUT}]`, DEFAULT_OUTPUT)
    .option('-i, --ignore <patterns>', 'Comma separated list of filenames to ignore, []', val => val.split(','), [])
    .parse(process.argv);

  if (program.config !== false) {
    const defaultConfig = path.join(process.cwd(), 'xpla.json');
    program.config = program.config === true ? defaultConfig : program.config || defaultConfig;
    const raw = JSON.parse(require('fs').readFileSync(program.config, 'utf8'));
    const result = validateConfig(raw);
    if (result.error) {
      console.error('Config: ', result.error.toString());
      process.exit(1);
    }

    const config = result.value;

    program.name = config.name;
    program.date = config.date || program.date;
    program.link = config.link || program.link;
    program.runner = config.runner || program.runner;
    program.runServer = config.runServer || program.runServer;
    program.ignore = config.ignore || program.ignore;
    if (config.branches) {
      program.fromDirs = false;
      program.branches = config.branches.map(branch => `${branch.name}=${branch.title || branch.name}`);
    } else {
      program.fromDirs = true;
      program.branches = config.dirs.map(dir => `${dir.name}=${dir.title || dir.name}`);
    }
  }

  const commits = program.fromDirs
    ? readCommitsFromDir(process.cwd(), program.branches, program.ignore)
    : readCommitsFromGit(process.cwd(), program.branches, program.ignore)
  ;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  commits
    .then(convertCommitsToSlidesContent)
    .then(saveSlides.bind(null, {
      output: program.output,
      runner: program.runner,
      runServer: program.runServer,
      resourceUrl: DEFAULT_RESOURCE_URL,
      version: DEFAULT_SOFTWARE_VERSION,
      name: program.name,
      date: program.date || dateformat(tomorrow, 'fullDate'),
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
