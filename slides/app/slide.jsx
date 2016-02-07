import 'babel-core/polyfill';
import 'normalize.css/normalize.css';
import './index.html';
import './slide.html';
import './slide1.html';
import './slide-ts.html';
import './slide-ts2.html';
import './slide-jsx.html';

import {initializeSlide} from './slide/slide';
import {getRunServerUrl} from './components/read/RunServerUrlState';


if (!document.querySelector('xp-deck')) {
  const runServerUrl = getRunServerUrl(document.querySelector('html'));
  initializeSlide(document.body, runServerUrl).catch((e) => console.error(e));

  // To support saving on slide and on deck we need to to this:
  document.body.setAttribute('xp-slide', window.location.href);
}

