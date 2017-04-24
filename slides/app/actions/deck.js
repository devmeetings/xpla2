// @flow

import {
  DECK_SLIDE_CHANGE,
  RECORDING_VIEW_TOGGLE, RECORDING_STATE_TOGGLE, RECORDING_RESET
} from './index';
import {createAction} from 'redux-actions';

export const deckSlideChange = createAction(DECK_SLIDE_CHANGE);
export const toggleRecordingState = createAction(RECORDING_STATE_TOGGLE);
export const toggleRecordingView = createAction(RECORDING_VIEW_TOGGLE);
export const resetRecordings = createAction(RECORDING_RESET);
