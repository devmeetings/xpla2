const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

module.exports = function (options, slides) {
  mkdirp.sync(options.output);
  slides.map(saveSlide.bind(this, options));
  saveDeck(options, slides);
};

function saveDeck (options, slides) {
  fs.writeFileSync(path.join(options.output, 'index.html'), deckToHtml(options, slides));
}

function saveSlide (options, slide) {
  console.log('Saving slide', slide.slideName);
  // Write deps
  slide.filesToSave.map((file) => {
    const filePath = path.join(options.output, file.path);
    const dir = path.dirname(filePath);
    // Create dir
    mkdirp.sync(dir);
    // Write file
    fs.writeFileSync(filePath, file.content);
  });
  // Write slides
  fs.writeFileSync(path.join(options.output, slideFileName(slide)), slideToHtml(options, slide));
}

function slideFileName (slide) {
  const title = trim(slide.title).replace(/[^a-z0-9\-_\.\s]/ig, '').replace(/\s/g, '_');
  return `${slide.slideName}-${title}.html`;
}

function deckToHtml (options, slides) {
  return `
    <!DOCTYPE html>
    <html xp-run-server-url="${options.runServer}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>Deck</title>
        <link type="text/css" rel="stylesheet" media="all" href="${options.resourceUrl}/css/deck.${options.version}.css" />
      </head>
      <body>

        <xp-deck>
          ${slides.map(slideToHtmlDeck).join('\n')}
        </xp-deck>

        <script async src="${options.resourceUrl}/js/deck.${options.version}.js"></script>
      </body>
    </html>
  `;
}

function slideToHtmlDeck (slide) {
  return `\t<link async rel="import" href="${slideFileName(slide)}" />`;
}

function slideToHtml (options, slide) {
  return `
    <!DOCTYPE html>
    <html xp-run-server-url="${options.runServer}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>${trim(slide.title)}</title>
        <script src="${options.resourceUrl}/js/slide_loader.${options.version}.js"></script>
      </head>
      <body class="xp-slide">
        <div class="xp-row with-comments">
          <div class="xp-column">
            <xp-editor active="${slide.active}">
              ${slide.editors.map(editorToHtml).join('\n')}
            </xp-editor>
          </div>
          <div class="xp-resize-column"></div>
          <div class="xp-column">
            <xp-preview runner="${options.runner}"></xp-preview>
          </div>
        </div>
        <div class="xp-resize-row"></div>
        <div class="xp-row comments">
          <h1>${trim(slide.title)}</h1>
        </div>
      </body>
    </html>
  `;
}

function trim (val) {
  return val.replace(/^\s*/g, '').replace(/\s*$/g, '');
}

function editorToHtml (editor) {
  const highlights = !editor.highlight ? '' : `highlight="${editor.highlight}" `;
  return `\t<script id="${editor.id}" ${highlights}type="application/octetstream" src="${editor.src}"></script>`;
}
