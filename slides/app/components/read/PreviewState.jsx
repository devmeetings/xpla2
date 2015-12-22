import {randomId} from './utils';

export function getPreviewState (dom) {
  const id = dom.id || randomId('preview');
  dom.id = id;

  return {
    id: id
  };
}
