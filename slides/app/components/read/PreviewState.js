import {randomId} from './utils';

export function getPreviewState (dom) {
  const id = dom.id || randomId('preview');
  const runner = dom.getAttribute('runner') || 'html';
  const runOnStart = dom.hasAttribute('no-run') ? false : true;
  dom.id = id;

  return {
    id, runner, runOnStart,
    isFresh: false,
    isLoading: false,
    isError: false,
    isTakingLong: false,
    runId: null,
  };
}
