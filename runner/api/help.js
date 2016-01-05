const marked = require('marked');
const fs = require('fs');
const highlight = require('highlight.js');

marked.setOptions({
  highlight: function (code) {
      return highlight.highlightAuto(code).value;
    }
});

module.exports = function getHelp () {
  return marked(fs.readFileSync(__dirname + '/../README.md', 'utf8'));
};
