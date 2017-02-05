'use strict';

const _ = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

module.exports = function saveSlides (options, slidesPerBranch) {
  const decks = Object.keys(slidesPerBranch).map(branch => {
    const options2 = _.clone(options);
    const split = branch.split('=');
    const shortName = split[0];
    const fullName = split[1] || capitalize(shortName);
    options2.output = path.join(options.output, shortName);

    const slides = slidesPerBranch[branch];
    mkdirp.sync(options2.output);
    slides.map(saveSlide.bind(this, options2));
    saveDeck(options2, fullName, slides);
    return { shortName, fullName };
  });

  fs.writeFileSync(path.join(options.output, 'index.html'), agenda(options, decks));
};

function capitalize (name) {
  if (name === 'current') {
    return 'Workshop Slides';
  }

  return name.replace(/-\._:/g, ' ')
    .split(' ')
    .map(word => {

    })
    .join(' ');
}

function saveDeck (options, name, slides) {
  fs.writeFileSync(path.join(options.output, 'index.html'), deckToHtml(options, name, slides));
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
  const title = trim(slide.title).replace(/[^a-z0-9\-_.\s]/ig, '').replace(/\s/g, '_');
  return `${slide.slideName}-${title}.html`;
}

function agenda (options, decks) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>${options.name}</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
        <link type="text/css" rel="stylesheet" media="all" href="${options.resourceUrl}/css/deck.${options.version}.css" />
        <style>
          body {
            margin: 5rem;
          }
          a[hhref] {
            color: #aaa;
          }
        </style>
      </head>
      <body style="text-align: center">
        <div style="min-width: 60vw; margin: 0 auto; display:inline-block; width: auto;text-align: left">
          <h1 style="text-align: center">${options.name}</h1>
          <h3 style="text-align: center; color: #aaa;">${options.date}</h3>
          <h3 style="text-align: center; color: #aaa;">${options.link ? options.link : genLink()}</h3>

          ${decks.map(deckToLink).join('\n')}
        </div>
      </body>
    </html>
  `;
}

function genLink () {
  return `
    <script>
      document.write(window.location);
    </script>
  `;
}

function deckToLink (deck, index) {
  const { shortName, fullName } = deck;
  return `
    <h3><a href="${shortName}/index.html">${index + 1}. ${fullName}</a></h3>
  `;
}

function deckToHtml (options, name, slides) {
  return `
    <!DOCTYPE html>
    <html xp-run-server-url="${options.runServer}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>${name}</title>
        <link type="text/css" rel="stylesheet" media="all" href="${options.resourceUrl}/css/deck.${options.version}.css" />
      </head>
      <body>

        <xp-deck back="../">
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

function getEditorWidth (slide) {
  if (!slide.displayPreview) {
    return '100%';
  }

  if (slide.displayTree) {
    return '65%';
  }

  return false;
}

function tasksToHtml (options, slide) {
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
        <div class="xp-row center" style="height: 100%">
          <h1>${trim(slide.comment)}</h1>
          ${slide.tasks}
        </div>
      </body>
    </html>
  `;
}

function slideToHtml (options, slide) {
  if (slide.tasks) {
    return tasksToHtml(options, slide);
  }

  const runner = slide.runner ? trim(slide.runner) : ((options.runner === 'auto') ? 'html' : options.runner);
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
