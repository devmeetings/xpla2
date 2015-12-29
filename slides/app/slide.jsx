import 'babel-core/polyfill';
import 'normalize.css/normalize.css';
import './index.html';
import './slide.html';
import './slide1.html';

import {initializeSlide} from './slide/slide';

import {getRunServerUrl} from './components/read/RunServerUrlState';
const runServerUrl = getRunServerUrl(document.querySelector('html'));
initializeSlide(document.body, runServerUrl);

if (!document.querySelector('xp-deck')) {
  // To support saving on slide and on deck we need to to this:
  document.body.setAttribute('xp-slide', window.location.href);
}

