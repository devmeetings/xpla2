// @flow

import 'babel-polyfill';
import 'normalize.css/normalize.css';
import './styles.scss';
import './index.html';
import './slide.html';
import './slide1.html';
import './slide-ts.html';
import './slide-ts2.html';
import './slide-jsx.html';
import './slide-timer.html';
import './slide-go.html';
import './slide-webpack.html';
import './slide-dart.html';
import './slide-elm.html';

import {nonNull} from './assert';
import {initializeSlide} from './slide/slide';
import {getRunServerUrl} from './components/read/RunServerUrlState';
import {resizer} from './components/Resizer/Resizer';

if (!document.querySelector('xp-deck')) {
  const $html = nonNull(document.querySelector('html'));
  const runServerUrl = getRunServerUrl($html);
  const presenceServerUrl = $html.getAttribute('xp-presence-url');
  const $body = nonNull(document.body);
  initializeSlide($body, runServerUrl, presenceServerUrl).catch((e) => console.error(e));

  // To support saving on slide and on deck we need to to this:
  $body.setAttribute('xp-slide', window.location.href);
  resizer($body);
}

