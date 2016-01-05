import _ from 'lodash';
import fetch from 'isomorphic-fetch';

import logger from '../../components/logger';
import {getFilesWithActiveAsJsArray} from '../../reducers.utils/editors';

import {saveFile} from './saveFile';

export function saveSlide (state, action) {
  let lastNumber = state.get('lastGeneratedSlideNumber');
  if (!lastNumber) {
    lastNumber = window.prompt('Slide number [default: 1]', 1);
    lastNumber = parseInt(lastNumber, 10);
    lastNumber -= 1;
    if (isNaN(lastNumber) || lastNumber < 0) {
      return state;
    }
  }
  const currentNumber = lastNumber + 1;

  const slideName = window.prompt('Slide title', `Slide ${currentNumber}`);
  if (!slideName) {
    return state;
  }

  generateSlide(state.toJS(), slideName)
    .then((slideContent) => {
      saveFile(slideContent, convertToFileName(slideName, currentNumber));
    })
    .catch((e) => {
      logger.error(e);
      alert('Unable to fetch & save slide');
    });

  return state.merge({
    lastGeneratedSlideNumber: currentNumber
  });
}

function generateSlide (state, slideName) {
  const $slide = document.querySelector('[xp-slide]');
  const slideUrl = $slide.getAttribute('xp-slide');

  const link = document.createElement('link');
  link.rel = 'import';
  link.href = slideUrl;

  return new Promise((resolve, reject) => {
    link.onerror = reject;
    link.onload = function (e) {
      const clone = link.import.querySelector('html').cloneNode(true);

      // Fill in the editors
      _.values(state.editors).map((editor, idx) => {
        const $editor = clone.querySelectorAll(`xp-editor`)[idx];
        $editor.setAttribute('active', editor.active.name);
        const files = getFilesWithActiveAsJsArray(editor);
        $editor.innerHTML =  '\n' + files.map((file) => {
          const content = fixPossibleScriptTags(file.content);
          return `\t<script id="${file.name}" type="application/octetstream">\n${content}\n</script>`;
        }).join('\n') + '\n';
      });

      // Fill the title
      clone.querySelector('title').innerHTML = slideName;

      resolve(clone.outerHTML);
    };
    document.head.appendChild(link);
  });
}

function fixPossibleScriptTags (val) {
  return val.replace(/<\/script>/gi, '<+/script>');
}

function convertToFileName (slideName, number) {
  return `${number}_${slideName}.html`;
}
