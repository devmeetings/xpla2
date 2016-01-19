// import 'babel-core/polyfill';
import 'normalize.css/normalize.css';
import './index.html';
import './deck.html';

import _ from 'lodash';
import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import {getRunServerUrl} from './components/read/RunServerUrlState';
import {getSlideState} from './components/read/SlideState';
import {getActiveSlideState} from './components/read/ActiveSlideState';

import DeckContainerWrapper from './containers/DeckWrapper';

import Store from './store';

const $xpDeck = document.querySelector('xp-deck');

const runServerUrl = getRunServerUrl(document.querySelector('html'));
const slides = _
    .chain($xpDeck.querySelectorAll('link'))
    .map(getSlideState)
    .value();

Promise.all(slides).then((slides) => {
  const activeSlide = getActiveSlideState(slides);

  const store = Store({
    runServerUrl,
    deck: {
      active: activeSlide,
      slides: slides
    }
  });

  render(
    <Provider store={store}>
      <DeckContainerWrapper />
    </Provider>,
    $xpDeck
  );
}).catch((err) => alert(err));
