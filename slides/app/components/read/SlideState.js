import {randomId} from './utils';
import logger from '../logger';

export function readTitle(dom) {
  const elem = dom.querySelector('title');
  if (!elem) {
    return '';
  }

  return elem.innerHTML;
}

export function getSlideState (dom) {
  const id = randomId(dom.href);
  dom.id = `slide_${id}`;


  if (!('import' in dom)) {
    logger.error(dom);
    throw new Error(`Unable to read slide at ${dom.href}`)
  }

  const onload = () => {
    const title = readTitle(dom.import);
    const body = dom.import.querySelector('body');
    const name = dom.hasAttribute('title') ? dom.getAttribute('title') : title;
    body.setAttribute('xp-slide', dom.href);
    dom.removeEventListener('load', onload);

    return {
      id: dom.id,
      shortName: name.replace(/[^a-zA-Z.0-9_\-]+/g, '_'),
      name: name,
      title: title,
      content: body
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
