import 'babel-polyfill'
import 'normalize.css/normalize.css'
import 'webcomponents.js/HTMLImports.js'
import './index.html'
import './deck.html'
import './styles.scss'

import _ from 'lodash'
import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import EventEmitter from 'event-emitter'

import {resizer} from './components/Resizer/Resizer'
import {getRunServerUrl} from './components/read/RunServerUrlState'
import {getSlideState} from './components/read/SlideState'
import {getActiveSlideState} from './components/read/ActiveSlideState'

import DeckContainerWrapper from './containers/DeckWrapper'

import { deckStore } from './store'

const $xpDeck = document.querySelector('xp-deck')
const back = $xpDeck.getAttribute('back') || ''

const $html = document.querySelector('html')
const runServerUrl = getRunServerUrl($html)
const presenceServerUrl = $html.getAttribute('xp-presence-url')
const slides = _
    .chain($xpDeck.querySelectorAll('link'))
    .map(getSlideState)
    .value()

Promise.all(slides).then((slides) => {
  const activeSlide = getActiveSlideState(slides)

  const slideEvents = new EventEmitter()

  const store = deckStore({
    runServerUrl,
    presenceServerUrl,
    deck: {
      active: activeSlide,
      slides: slides,
      back: back
    }
  }, slideEvents)

  render(
    <Provider store={store}>
      <DeckContainerWrapper slideEvents={slideEvents} />
    </Provider>,
    $xpDeck
  )
}).catch((err) => {
  console.error(err)
  window.alert(err)
})

resizer($xpDeck)
