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
  runServerUrl: string,
  runnerName: string,
  skipCache: bool,
  files: [{
    name: string,
    content: string
  }]
};

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

    fetch(`${payload.runServerUrl}/api/commitAndRun`, {
      credentials: 'same-origin',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        runnerName: payload.runnerName,
        skipCache: payload.skipCache,
        files: payload.files.map((file) => ({
          name: file.name,
          content: file.content
        }))
      })
    })
      .then(checkStatus)
      .then((response) => response.json())
      .then((data) => {
        clearTimeout(timeout)
        dispatch(commitAndRunCodeFinished({
          runId: data.runId,
          previewId: payload.previewId
        }))
      })
      .catch((err) => {
        clearTimeout(timeout)
        dispatch(commitAndRunCodeError({
          previewId: payload.previewId,
          error: err
        }))
      })
  }
}
