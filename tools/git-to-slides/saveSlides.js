const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const DIR = 'slides';
const RUNNER = 'html';
const RUN_SERVER = 'http://xpla.org';
const VERSION = '3.0.0';
const STATIC_FILES = 'http://xpla.org/static/';

module.exports = function (slides) {
  return slides.map(saveSlide);
};


function saveSlide (slide) {
  console.log('Saving slide', slide.slideName);
  mkdirp.sync(DIR);
  // Write deps
  slide.filesToSave.map((file) => {
    const filePath = path.join(DIR, file.path);
    const dir = path.dirname(filePath);
    // Create dir
    mkdirp.sync(dir);
    // Write file
    fs.writeFileSync(filePath, file.content);
  });
  // Write slides
  fs.writeFileSync(path.join(DIR, `${slide.slideName}.html`), slideToHtml(slide));
}


function slideToHtml (slide) {
  const runner = RUNNER;
  return `
    <!DOCTYPE html>
    <html xp-run-server-url="${RUN_SERVER}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>${slide.title}</title>
        <link type="text/css" rel="stylesheet" media="all" href="${STATIC_FILES}css/slide.${VERSION}.css" />
      </head>
      <body class="xp-slide">
        <div class="xp-column" style="width:50%">
          <xp-editor active="${slide.active}">
            ${slide.editors.map(editorToHtml).join('\n')}
          </xp-editor>
        </div>
        <div class="xp-column" style="width:50%">
          <xp-preview runner="html"></xp-preview>
        </div>
        <script src="${STATIC_FILES}js/slide.${VERSION}.js"></script>
      </body>
    </html>
  `;
}

function editorToHtml (editor) {
  return `\t<script id="${editor.id}" highlight"="${editor.highlight}" type="application/octetstream" src="${editor.src}"></script>`;
}
