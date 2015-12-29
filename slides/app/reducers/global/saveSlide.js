import _ from 'lodash';
import fetch from 'isomorphic-fetch';

export function saveSlide (state, action) {
  const lastNumber = state.get('lastGeneratedSlideNumber') || 1;
  const currentNumber = lastNumber + 1;

  const slideName = window.prompt('Slide title');
  if (!slideName) {
    return state;
  }

  generateSlide(state.toJS(), slideName)
    .then((slideContent) => {
      saveFile(slideContent, convertToFileName(slideName, currentNumber));
    })
    .catch((e) => {
      console.error(e);
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
        $editor.innerHTML =  editor.files.map((file) => {
          return `<script id="${file.name}" type="application/octetstream">\n${file.content}\n</script>`;
        }).join('\n');
      });

      // Fill the title
      clone.querySelector('title').innerHTML = slideName;

      resolve(clone.outerHTML);
    };
    document.head.appendChild(link);
  });
}

function saveFile (content, fileName) {
  const blob = new Blob([content], {
    type: 'application/html'
  });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function convertToFileName (slideName, number) {
  return `${number}_${slideName}.html`;
}
