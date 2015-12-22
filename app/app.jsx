import 'babel-core/polyfill';
import 'normalize.css/normalize.css';
import './index.html';

import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import Store from './store';
import {getEditorState} from './components/ReadEditorState';
import EditorWrapper from './containers/EditorWrapper';

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

Object.keys(editors).map((editorId) => {

  render(
    <Provider store={store}>
      <EditorWrapper
        editorId={editorId}
        />
    </Provider>,
    document.querySelector(`#${editorId}`)
  );

});
