import {randomId} from './utils';
import logger from '../logger';

export function getSlideState (dom) {
  const id = randomId(dom.href);
  dom.id = `slide_${id}`;

  if (!dom.import) {
    logger.error(dom);
    throw new Error(`Unable to read slide at ${dom.href}`)
  }

  const title = dom.import.querySelector('title').innerHTML;
  const body = dom.import.querySelector('body');
  body.setAttribute('xp-slide', dom.href);

  return {
    id: dom.id,
    shortName: title,
    title: title,
    content: body
  };
}
