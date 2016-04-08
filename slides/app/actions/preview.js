import {COMMIT_AND_RUN_CODE, COMMIT_AND_RUN_CODE_STARTED, COMMIT_AND_RUN_CODE_ERROR, COMMIT_AND_RUN_CODE_LONG} from './index';
import {createAction} from 'redux-actions';
import fetch from 'isomorphic-fetch';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

const CODE_TIMEOUT = 6000;

const commitAndRunCodeStarted = createAction(COMMIT_AND_RUN_CODE_STARTED);
const commitAndRunCodeLong = createAction(COMMIT_AND_RUN_CODE_LONG);
const commitAndRunCodeError = createAction(COMMIT_AND_RUN_CODE_ERROR);
const commitAndRunCodeFinished = createAction(COMMIT_AND_RUN_CODE);

export const commitAndRunCode = (payload) => {
  return (dispatch) => {
    dispatch(commitAndRunCodeStarted({
      previewId: payload.previewId
    }));

    const timeout = setTimeout(() => {
      dispatch(commitAndRunCodeLong({
        previewId: payload.previewId
      }));
    }, CODE_TIMEOUT);

    fetch(`${payload.runServerUrl}/api/commitAndRun`, {
      credentials: 'same-origin',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        runnerName: payload.runnerName,
        files: payload.files.map((file) => ({
          name: file.name,
          content: file.content
        }))
      })
    })
      .then(checkStatus)
      .then((response) => response.json())
      .then((data) => {
        clearTimeout(timeout);
        dispatch(commitAndRunCodeFinished({
          runId: data.runId,
          previewId: payload.previewId
        }));
      })
      .catch((err) => {
        clearTimeout(timeout);
        dispatch(commitAndRunCodeError({
          previewId: payload.previewId,
          error: err
        }));
      });
  };
};
