// @flow

import deckReducer from './deck'
import editors from './editors'
import previews from './previews'
import {runServerUrl, presenceServerUrl} from './servers'
import workMode from './workMode'
import recordings from './recordings'
import annotations from './annotations'
import presence from './presence'
import timer from './timer'
import tasks from './tasks'
import lastGeneratedSlideNumber from './lastGeneratedSlideNumber'

export const deck = {
  deck: deckReducer,
  runServerUrl,
  presenceServerUrl,
  presence,
  recordings
}

export const slide = {
  editors,
  previews,
  runServerUrl,
  presenceServerUrl,
  workMode,
  lastGeneratedSlideNumber,
  annotations,
  timer,
  tasks
}
