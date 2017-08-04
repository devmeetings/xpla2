// @flow

import {
  DECK_SLIDE_CHANGE, DECK_SLIDE_ACTION, DECK_PLAY_ACTION, DECK_PAGE_ACTIVE,
  RECORDING_VIEW_TOGGLE, RECORDING_STATE_TOGGLE, RECORDING_RESET, RECORDING_SET
} from './index'
import {createAction} from 'redux-actions'

export const deckSlideChange = createAction(DECK_SLIDE_CHANGE)
export const toggleRecordingState = createAction(RECORDING_STATE_TOGGLE)
export const toggleRecordingView = createAction(RECORDING_VIEW_TOGGLE)
export const resetRecordings = createAction(RECORDING_RESET)
export const setRecordings = createAction(RECORDING_SET)
export const slideAction = createAction(DECK_SLIDE_ACTION)
export const playAction = createAction(DECK_PLAY_ACTION)
export const pageActive = createAction(DECK_PAGE_ACTIVE)
