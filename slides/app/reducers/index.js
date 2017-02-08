import deckReducer from './deck';
import editors from './editors';
import previews from './previews';
import {runServerUrl, presenceServerUrl} from './servers';
import workMode from './workMode';
import annotations from './annotations';
import timer from './timer';
import tasks from './tasks';
import lastGeneratedSlideNumber from './lastGeneratedSlideNumber';

export const deck = {
  deck: deckReducer,
  runServerUrl,
  presenceServerUrl,
};

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
};
