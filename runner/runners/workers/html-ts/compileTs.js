'use strict';

const ts = require('typescript');
const fs = require('fs');
const _ = require('lodash');

const buildErrorsPage = require('./buildErrorsPage');

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

function compileTsFilesAndGetOutputs (workspace) {
  // Extract tsFiles
  const tsFiles = Object.keys(workspace).filter(function (fileName) {
    return /\.tsx?$/i.test(fileName);
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
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.System,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      inlineSourceMap: true,
      inlineSources: true
    }
  );
  let files = nonTsFiles.map((fileName) => workspace[fileName]);
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
      const f = workspace[fileName];
      if (f) {
        return f.content;
      }

      // for lib.d.ts
      if (fs.existsSync(fileName)) {
        const c = fs.readFileSync(fileName, encoding);
        return c.toString();
      }

      fileName = __dirname + '/' + fileName;
      if (fs.existsSync(fileName)) {
        const c = fs.readFileSync(fileName, encoding);
        return c.toString();
      }

      return '';
    },
    writeFile: function () {
    },
    resolvePath: function (path) {
      return path;
    },
    fileExists: function (path) {
      const existsInWorkspace = !!workspace[path];
      if (existsInWorkspace) {
        return true;
      }
      path = __dirname + '/' + path;
      return fs.existsSync(path);
    },
    directoryExists: function (path) {
      return true;
    }
  };
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
