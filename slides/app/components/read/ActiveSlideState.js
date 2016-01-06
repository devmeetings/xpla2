
import {readUrl, getSlideId} from '../DeckLocationUpdater/DeckLocationUpdater';

export function getActiveSlideState (slides) {
  const url = readUrl();
  return slides.filter((slide) => getSlideId(slide) === url)[0] || slides[0]
}
