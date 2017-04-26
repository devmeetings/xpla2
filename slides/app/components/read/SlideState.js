import {findId} from './utils';
import logger from '../logger';

export function readTitle (dom) {
  // Firefox polyfill has wrong title, but the right one is inside body.
  let elem = dom.querySelector('body title');

  if (!elem) {
    elem = dom.querySelector('title');
  }

  if (!elem) {
    return '';
  }

  return elem.innerHTML;
}

export function getSlideState (dom) {
  const id = findId(dom.href, dom);
  dom.id = `slide_${id}`;

  if (!('import' in dom)) {
    logger.warn('Using HTMLImports polyfill. Fingers crossed.');
  }

  const onload = () => {
    const title = readTitle(dom.import);
    const body = dom.import.querySelector('body');
    const name = dom.hasAttribute('title') ? dom.getAttribute('title') : title;
    const path = dom.hasAttribute('root') ? dom.getAttribute('root') : '';
    body.setAttribute('xp-slide', dom.href);
    dom.removeEventListener('load', onload);

    return {
      id: dom.id,
      shortName: name.replace(/[^a-zA-Z.0-9_\-]+/g, '_'),
      name: name,
      title: title,
      content: body,
      path: path
    };
  };

  if (!dom.import || !dom.import.querySelector('body')) {
    // Add event listener
    return new Promise((resolve, reject) => {
      dom.addEventListener('load', () => {
        resolve(onload());
      });
      dom.addEventListener('error', reject);
    });
  }
  return Promise.resolve(onload());
}
