import {findId} from './utils'

export function getPreviewState (dom) {
  const id = dom.id || findId('preview', dom)
  const runner = dom.getAttribute('runner') || 'html'
  const runOnStart = !dom.hasAttribute('no-run')
  const file = dom.getAttribute('file') || ''
  const isServer = dom.hasAttribute('server')

  dom.id = id

  return {
    id,
    runner,
    runOnStart,
    file,
    isServer,
    isFresh: false,
    isLoading: false,
    isError: false,
    isTakingLong: false,
    runId: null
  }
}
