const marked = require('marked');
const fs = require('fs');
const highlight = require('highlight.js');

marked.setOptions({
  highlight: function (code) {
      return highlight.highlightAuto(code).value;
    }
});

module.exports = function getHelp () {
  return `
  <html>
  <head>
    <title>XplaRunner Help</title>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.0.0/styles/default.min.css">
    <style>
    pre {
      background: #efefef;
      padding: 10px;
      border: 1px solid #aaa;
    }
    </style>
  </head>
  <body>
  ${marked(fs.readFileSync(__dirname + '/../README.md', 'utf8'))}
  </body>
  </html>`;
};
