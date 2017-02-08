import {findId} from './utils';

export function getPreviewState (dom) {
  const id = dom.id || findId('preview', dom);
  const runner = dom.getAttribute('runner') || 'html';
  const runOnStart = dom.hasAttribute('no-run') ? false : true;
  const file = dom.getAttribute('file') || '';

  dom.id = id;

  return {
    id, runner, runOnStart, file,
    isFresh: false,
    isLoading: false,
    isError: false,
    isTakingLong: false,
    runId: null,
  };
}
