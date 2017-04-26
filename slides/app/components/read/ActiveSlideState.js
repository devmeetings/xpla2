
import {readUrl, getSlideId} from '../DeckLocationUpdater/DeckLocationUpdater'

export function getActiveSlideState (slides) {
  const url = readUrl()
  const slide = slides.filter((slide) => getSlideId(slide) === url.slide)[0] || slides[0]
  slide.annotation = url.annotation
  return slide
}
