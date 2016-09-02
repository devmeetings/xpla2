"use strict";

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

function getEditorWidth(slide) {
  if (!slide.displayPreview) {
    return '100%';
  }

  if (slide.displayTree) {
    return '65%';
  }

  return false;
}

function tasksToHtml (options, slide) {
  let subcontent = '';
  if (slide.title !== slide.comment) {
    subcontent = `<h3>${slide.comment}</h3>`;
  }

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
        ${slide.tasks}
        ${subcontent}
      </body>
    </html>
  `;
}

function slideToHtml (options, slide) {
  if (slide.tasks) {
    return tasksToHtml(options, slide);
  }

  const runner = slide.runner ? trim(slide.runner) : options.runner;
  const editorWidth = getEditorWidth(slide);

  const editor = `
    <div class="xp-column"${editorWidth ? ' style="width: ' + editorWidth + '"' : ''}>
      <xp-editor active="${slide.active}" ${slide.displayTree ? 'tree' : ''}>
        ${slide.editors.map(editorToHtml).join('\n')}
      </xp-editor>
    </div>
  `;

  const preview = `
    <div class="xp-column"${slide.displayTree ? ' style="width: 35%"' : ''}>
      <xp-preview runner="${runner}"${slide.preview ? ' file="' + trim(slide.preview) + '"' : ''}></xp-preview>
    </div>
  `;

  const slideContent = !slide.displayPreview ? editor : `
    ${editor}
    <div class="xp-resize-column"></div>
    ${preview}
  `;

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
          ${slideContent}
        </div>
        <div class="xp-resize-row"></div>
        <div class="xp-row comments">
          <xp-annotations>
            <header><h1>${trim(slide.comment)}</h1></header>
            ${slide.annotations}
          </xp-annotations>
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
