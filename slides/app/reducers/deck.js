import {DECK_SLIDE_CHANGE} from '../actions';

import {createReducer} from 'redux-immutablejs';
import {fromJS} from 'immutable';

function findSlideById (slides, slideId) {
  return slides.find((slide) => slide.get('id') === slideId);
}

export default createReducer(fromJS({
  active: null,
  slides: [],
  back: ''
}), {
  [DECK_SLIDE_CHANGE]: (deck, action) => {
    const newSlideId = action.payload.newSlideId;
    const activeSlide = findSlideById(deck.get('slides'), newSlideId);

    if (!activeSlide) {
      throw new Error('Unable to change active slide to: ' + newSlideId);
    }

    return deck.set(
      'active',
      activeSlide
    );
  }
});
