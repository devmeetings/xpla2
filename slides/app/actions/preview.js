import {COMMIT_AND_RUN_CODE, COMMIT_AND_RUN_CODE_STARTED, COMMIT_AND_RUN_CODE_ERROR} from './index';
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

const commitAndRunCodeStarted = createAction(COMMIT_AND_RUN_CODE_STARTED);
const commitAndRunCodeError = createAction(COMMIT_AND_RUN_CODE_ERROR);
const commitAndRunCodeFinished = createAction(COMMIT_AND_RUN_CODE);

export const commitAndRunCode = (payload) => {
  return (dispatch) => {
    dispatch(commitAndRunCodeStarted({
      previewId: payload.previewId
    }));

    fetch(`${payload.runServerUrl}/api/commitAndRun`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        runnerName: payload.runnerName,
        files: payload.files
      })
    })
      .then(checkStatus)
      .then((response) => response.json())
      .then((data) => {
        dispatch(commitAndRunCodeFinished({
          runId: data.runId,
          previewId: payload.previewId
        }));
      })
      .catch((err) => {
        dispatch(commitAndRunCodeError(err));
      });
  };
};
