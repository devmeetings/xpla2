import {randomId} from './utils';

export function getSlideState (dom) {
  const id = randomId(dom.href);
  dom.id = `slide_${id}`;

  if (!dom.import) {
    console.error(dom);
    throw new Error(`Unable to read slide at ${dom.href}`)
  }

  const body = dom.import.querySelector('body');
  body.setAttribute('xp-slide', dom.href);

  return {
    id: dom.id,
    title: dom.import.querySelector('title').innerHTML,
    content: body
  };
}
