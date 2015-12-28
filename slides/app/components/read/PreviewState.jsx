import {randomId} from './utils';

export function getPreviewState (dom) {
  const id = dom.id || randomId('preview');
  const runner = dom.getAttribute('runner') || 'html';
  dom.id = id;

  return {
    id, runner,
    isLoading: false,
    runId: null
  };
}
