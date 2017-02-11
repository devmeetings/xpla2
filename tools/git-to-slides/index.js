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
    .option('-a, --author [author]', 'Author name []', '')
    .option('-e, --author-link [link]', 'Author link, twitter handle or e-mail address []', '')
    .option('-r, --runner [runner]', `Runner type [${DEFAULT_RUNNER}]`, DEFAULT_RUNNER)
    .option('-s, --run-server [url]', `Run server url, [${DEFAULT_RUN_SERVER}]`, DEFAULT_RUN_SERVER)
    .option('-o, --output [dir]', `Output directory [${DEFAULT_OUTPUT}]`, DEFAULT_OUTPUT)
    .option('-i, --ignore <patterns>', 'Comma separated list of filenames to ignore, []', val => val.split(','), [])
    .parse(process.argv);

  if (!readConfigFile(process.cwd(), program.config, program)) {
    process.exit(1);
  }

  const commits = program.fromDirs
    ? readCommitsFromDir(process.cwd(), program.branches, program.ignore)
    : readCommitsFromGit(process.cwd(), program.branches, program.ignore)
  ;

  commits
    .then(convertCommitsToSlidesContent)
    .then(saveSlides.bind(null, {
      output: program.output,
      runner: program.runner,
      runServer: program.runServer,
      resourceUrl: DEFAULT_RESOURCE_URL,
      version: DEFAULT_SOFTWARE_VERSION,
      name: program.name,
      date: program.date,
      link: program.link,
      author: program.author,
      authorLink: program.authorLink
    }))
    .catch(rethrow);
}

function readConfigFile (workingDir, cfg, program = {}) {
  if (cfg !== false) {
    const defaultConfig = path.join(workingDir, 'xpla.json');
    program.config = cfg === true ? defaultConfig : cfg || defaultConfig;

    const raw = JSON.parse(require('fs').readFileSync(program.config, 'utf8'));
    const result = validateConfig(raw);
    if (result.error) {
      console.error('Config: ', result.error.toString());
      return false;
    }

    const config = result.value;
    program.name = config.name;
    program.date = config.date || program.date;
    program.link = config.link || program.link;
    program.runner = config.runner || program.runner;
    program.runServer = config.runServer || program.runServer;
    program.ignore = config.ignore || program.ignore;
    program.author = config.author.name || program.author.name;
    program.authorLink = config.author.link || program.author.link;
    if (config.branches) {
      program.fromDirs = false;
      program.branches = config.branches.map(branch => `${branch.name}=${branch.title || branch.name}=${branch.description || ''}`);
    } else {
      program.fromDirs = true;
      program.branches = config.dirs.map(dir => `${dir.name}=${dir.title || dir.name}=${dir.description || ''}`);
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  program.date = program.date || dateformat(tomorrow, 'fullDate');

  return program;
}

function rethrow (err) {
  console.error(err);
  setTimeout(() => {
    throw err;
  });
}

module.exports = {
  readCommitsFromGit,
  readCommitsFromDir,
  convertCommitsToSlidesContent,
  readConfigFile,
  saveSlides,
  DEFAULT_RUN_SERVER,
  DEFAULT_RESOURCE_URL,
  DEFAULT_SOFTWARE_VERSION,
  rethrow
};
