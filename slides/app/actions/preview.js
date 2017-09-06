// @flow

import {COMMIT_AND_RUN_CODE, COMMIT_AND_RUN_CODE_STARTED, COMMIT_AND_RUN_CODE_ERROR, COMMIT_AND_RUN_CODE_LONG} from './index'
import {createAction} from 'redux-actions'
import fetch from 'isomorphic-fetch'

function checkStatus (response: { status: number, statusText: string }) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    const error: any = new Error(response.statusText)
    error.response = response
    throw error
  }
}

const CODE_TIMEOUT = 6000

const commitAndRunCodeStarted = createAction(COMMIT_AND_RUN_CODE_STARTED)
const commitAndRunCodeLong = createAction(COMMIT_AND_RUN_CODE_LONG)
const commitAndRunCodeError = createAction(COMMIT_AND_RUN_CODE_ERROR)
const commitAndRunCodeFinished = createAction(COMMIT_AND_RUN_CODE)

type PayloadT = {
  previewId: number,
  isServer: bool,
  runServerUrl: string,
  runnerName: string,
  skipCache: bool,
  files: [{
    name: string,
    content: string
  }]
}

type ClearPayloadT = PayloadT & {
  runId: string
}

function doFetch (url, payload = null, method = null) {
  return fetch(url, {
    mode: 'cors',
    credentials: 'same-origin',
    method: method || (payload ? 'post' : 'get'),
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload && JSON.stringify(payload)
  })
}

export const clearRunCache = (payload: ClearPayloadT) => {
  return (dispatch: (any) => void) => {
    doFetch(`${payload.runServerUrl}/api/results/${payload.runId}`, null, 'delete')
      .then(() => {
        commitAndRunCode(payload)(dispatch)
      })
      .catch(err => {
        console.error('Cannot clear cache.', err)
      })
  }
}

export const commitAndRunCode = (payload: PayloadT) => {
  return (dispatch: (any) => void) => {
    dispatch(commitAndRunCodeStarted({
      previewId: payload.previewId,
      code: payload
    }))

    const timeout = setTimeout(() => {
      dispatch(commitAndRunCodeLong({
        previewId: payload.previewId
      }))
    }, CODE_TIMEOUT)

    doFetch(`${payload.runServerUrl}/api/commitAndRun`, {
      runnerName: payload.runnerName,
      skipCache: payload.skipCache,
      files: payload.files.map((file) => ({
        name: file.name,
        content: file.content
      }))
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(data => {
        if (!payload.isServer) {
          return data
        }
        const { runId } = data
        // fetch port and URL
        return Promise.all(
            [
              doFetch(`${payload.runServerUrl}/api/results/${runId}.json/port`),
              doFetch(`${payload.runServerUrl}/api/results/${runId}.json/url`)
            ].map(x => x.then(checkStatus).then(res => res.json()))
          )
          .then(results => {
            const [{ port }, { url }] = results
            data.port = parseInt(port, 10)
            data.url = url
            return data
          })
      })
      .then(data => {
        const { runId, port, url } = data
        clearTimeout(timeout)
        dispatch(commitAndRunCodeFinished({
          runId,
          port,
          url,
          previewId: payload.previewId
        }))
      })
      .catch(err => {
        clearTimeout(timeout)
        dispatch(commitAndRunCodeError({
          previewId: payload.previewId,
          error: err
        }))
      })
  }
}
