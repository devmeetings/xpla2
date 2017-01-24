const marked = require('marked');
const fs = require('fs');
const highlight = require('highlight.js');
const path = require('path');

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
  ${marked(fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8'))}
  <h1>Detailed docs</h1>
  ${marked(fs.readFileSync(path.jon(__dirname, '..', 'docs.md'), 'utf8'))}
  </body>
  </html>`;
};
