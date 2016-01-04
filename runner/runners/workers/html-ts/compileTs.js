'use strict';

const ts = require('typescript');
const fs = require('fs');
const _ = require('lodash');

module.exports = function compileTsAndReturnSemanticErrors (code) {
  const output = compileTsFilesAndGetOutputs(code.files);
  const files = _.values(code.files).concat(output.files);

  if (output.errors.length) {
    return {
      success: false,
      files: files.concat([
        {
          name: 'index.html',
          content: buildErrorsPage(output.errors),
          mimetype: 'text/html'
        }
      ])
    };
  }

  return {
    success: true,
    files: files
  };
};

function buildErrorsPage(errors) {
  return flatten([
    '<html><head>',
    '<style>',
    '.error { color: #a44; }',
    '.error strong { color: #f44; }',
    '</style>',
    '</head><body>',
    '<div>',
    errors.map(function (err) {
      return [
        '<div class="error">',
        '<strong>' + err.filePath + ':' + (err.startPos.line + 1) + ':' + (err.startPos.col + 1) + '</strong>',
        '<pre>' + err.message
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(err.preview, function (x) {
            return '<strong>' + x + '</strong>';
          }) + '</pre>',
        '</div>'
      ];
    }),
    '</div>',
    '</body></html>'
  ]).join('\n')
}

function compileTsFilesAndGetOutputs (workspace) {

  // Extract tsFiles
  const tsFiles = Object.keys(workspace).filter(function (fileName) {
    return /\.ts$/i.test(fileName);
  });
  const nonTsFiles = Object.keys(workspace).filter((fileName) => {
    return tsFiles.indexOf(fileName) === -1;
  });

  // set proper ts.sys implementation
  extend(ts.sys, tsSysForWorkspace(workspace));

  // run the compiler
  const program = ts.createProgram(
    tsFiles,
    {
      diagnostics: true,
      target: 1, // es5
      module: 4, // system
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      inlineSourceMap: true,
      inlineSources: true
    }
  );
  let files = nonTsFiles.map((fileName) => ({
    name: fileName,
    content: workspace[fileName].content,
    mimetype: workspace[fileName].mimetype
  }));
  // Assuming this runs synchronously!
  const emitResult = program.emit(undefined, function (_fileName, _content) {
    files.push({
      name: _fileName,
      content: _content,
      mimetype: 'application/javascript'
    });
  });
  const diagnostics =
    []
    .concat(program.getOptionsDiagnostics())
    .concat(program.getGlobalDiagnostics())
    .concat(program.getSyntacticDiagnostics())
    .concat(program.getSemanticDiagnostics())
    .concat(emitResult.diagnostics);
  return {
    files: files,
    errors: diagnostics.filter(function (d) {
      return !!d.file;
    }).map(diagnosticToTSError)
  };
}

function tsSysForWorkspace (workspace) {
  return {
    newLine: '\n',
    readFile: function (fileName, encoding) {
      fileName = fileName.replace(/\.ts\.ts$/, '.ts');
      const f = workspace[fileName];
      if (f) {
        return f.content;
      }

      if (fs.existsSync(fileName)) {
        const c = fs.readFileSync(fileName, encoding);
        return c.toString();
      }

      fileName = __dirname + '/node_modules/' + fileName;
      if (fs.existsSync(fileName)) {
        const d = fs.readFileSync(fileName, encoding);
        return d.toString();
      }

      return '';
    },
    writeFile: function () {
    },
    resolvePath: function (path) {
      return path;
    },
    fileExists: function (path) {
      path = path.replace(/\.ts\.ts$/, '.ts');
      const existsInWorkspace = !!workspace[path];
      if (existsInWorkspace) {
        return true;
      }
      path = __dirname + '/node_modules/' + path;
      return fs.existsSync(path);
    },
    directoryExists: function (path) {
      return true;
    }
  };
}

function flatten (arr) {
  if (!arr || !arr.reduce) {
    return [arr];
  }

  return arr.reduce(function (memo, v) {
    return memo.concat(flatten(v));
  }, []);
}

function extend (a, b) {
  Object.keys(b).forEach(function (k) {
    a[k] = b[k];
  });
}

function diagnosticToTSError (diagnostic) {
  const filePath = diagnostic.file.fileName;
  const startPosition = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  const endPosition = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start + diagnostic.length);

  return {
    filePath: filePath,
    startPos: { line: startPosition.line, col: startPosition.character },
    endPos: { line: endPosition.line, col: endPosition.character },
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    preview: diagnostic.file.text.substr(diagnostic.start, diagnostic.length)
  };
}
