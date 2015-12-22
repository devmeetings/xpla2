import 'babel-core/polyfill';
import 'normalize.css/normalize.css';
import './index.html';

import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import Store from './store';
import {getEditorState} from './components/ReadEditorState';
import Slide from './containers/Slide';

const editors = [].map.call(
  document.querySelectorAll('xp-editor'),
  getEditorState
).reduce((memo, editor) => {
  memo[editor.id] = editor;
  return memo;
}, {});

const store = Store({
  editors: editors
});

render(
  <Provider store={store}>
    <Slide />
  </Provider>,
  document.querySelector('body')
);
