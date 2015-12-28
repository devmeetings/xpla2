import 'babel-core/polyfill';
import 'normalize.css/normalize.css';
import './index.html';

import _ from 'lodash';
import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import EventEmitter from 'event-emitter';

import Store from './store';
import {getEditorState} from './components/read/EditorState';
import {getPreviewState} from './components/read/PreviewState';
import {getRunServerUrl} from './components/read/RunServerUrlState';

import EditorWrapper from './containers/EditorWrapper';
import PreviewWrapper from './containers/PreviewWrapper';

const editors = getAsMap('xp-editor', getEditorState);
const previews = getAsMap('xp-preview', getPreviewState);
const runServerUrl = getRunServerUrl(document.querySelector('html'));

const store = Store({
  editors, previews, runServerUrl
});
const globalEvents = new EventEmitter({});

renderComponents(editors, EditorWrapper, 'editorId');
renderComponents(previews, PreviewWrapper, 'previewId');

function getAsMap (query, mapper) {
  const elems = _
    .chain(document.querySelectorAll(query))
    .map(mapper)
    .indexBy('id')
    .value();

  return elems;
}

function renderComponents (elems, Component, propName) {
  Object.keys(elems).map((id) => {
    const props = {
      [propName]: id,
      globalEvents: globalEvents
    };

    render(
      <Provider store={store}>
        <Component {...props} />
      </Provider>,
      document.querySelector(`#${id}`)
    );
  });
}
