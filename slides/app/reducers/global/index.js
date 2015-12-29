import {WORK_MODE_SAVE_SLIDE} from '../../actions';
import {saveSlide} from './saveSlide';

export default function (state, action) {
  switch (action.type) {
    case WORK_MODE_SAVE_SLIDE:
      return saveSlide(state, action);
  }
  return state;
}
