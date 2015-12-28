import 'babel-core/polyfill';
import 'normalize.css/normalize.css';
import './index.html';

import _ from 'lodash';
import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import Store from './store';
import {getEditorState} from './components/read/EditorState';
import {getPreviewState} from './components/read/PreviewState';

import EditorWrapper from './containers/EditorWrapper';
import PreviewWrapper from './containers/PreviewWrapper';

const editors = getAsMap('xp-editor', getEditorState);
const previews = getAsMap('xp-preview', getPreviewState);

const store = Store({
  editors: editors,
  previews: previews,
  runServerUrl: 'http://localhost:3030'
});

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
      [propName]: id
    };

    render(
      <Provider store={store}>
        <Component {...props} />
      </Provider>,
      document.querySelector(`#${id}`)
    );
  });
}
