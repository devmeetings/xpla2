module.exports = function buildErrorsPage (errors) {
  return flatten([
    '<html><head>',
    '<style>',
    '.error { color: #a44; }',
    '.error strong { color: #f44; }',
    '.error .message { font-family: monospace; }',
    '</style>',
    '</head><body>',
    '<div>',
    errors.map(function (err) {
      return [
        '<div class="error">',
        '<strong>' + err.filePath + ':' + (err.startPos.line + 1) + ':' + (err.startPos.col + 1) + '</strong>',
        '<div class="message">' + err.message
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(err.preview, function (x) {
            return '<strong>' + x + '</strong>';
          }) + '</div>',
        '</div>'
      ];
    }),
    '</div>',
    '</body></html>'
  ]).join('\n');
};

function flatten (arr) {
  if (!arr || !arr.reduce) {
    return [arr];
  }

  return arr.reduce(function (memo, v) {
    return memo.concat(flatten(v));
  }, []);
}
