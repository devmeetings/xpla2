import _ from 'lodash';
import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {Provider} from 'react-redux';
import EventEmitter from 'event-emitter';

import Store from '../store';
import {getEditorState} from '../components/read/EditorState';
import {getPreviewState} from '../components/read/PreviewState';
import {readTitle} from '../components/read/SlideState';

import EditorWrapper from '../containers/EditorWrapper';
import PreviewWrapper from '../containers/PreviewWrapper';

import './slide.scss';

export function initializeSlide(dom, runServerUrl) {
  if (!dom) {
    throw new Error('Provide DOM element!');
  }

  if (!runServerUrl) {
    throw new Error('RunServerUrl is missing.');
  }
  const title = readTitle(dom.parentNode);
  const editorsP = getAsMap(dom, 'xp-editor', getEditorState);
  const previewsP = getAsMap(dom, 'xp-preview', getPreviewState);

  return Promise.all([editorsP, previewsP])
    .then((a) => {
      const [editors, previews] = a;

      const store = Store({
        editors, previews, runServerUrl, title
      });

      const globalEvents = new EventEmitter({});

      const $editors = renderComponents(dom, globalEvents, store, editors, EditorWrapper, 'editorId');
      const $previews = renderComponents(dom, globalEvents, store, previews, PreviewWrapper, 'previewId');

      return destroyFunction(
        []
        .concat($editors)
        .concat($previews)
      );
    });
}

function destroyFunction ($elems) {
  return () => {
    $elems.map(unmountComponentAtNode);
  };
}

function getAsMap (dom, query, mapper) {
  const elems = _
    .chain(dom.querySelectorAll(query))
    .map(mapper)
    .value();

  return Promise.all(elems).then((elemsResolved) => {
    return _.indexBy(elemsResolved, 'id');
  });
}

function renderComponents (dom, globalEvents, store, elems, Component, propName) {
  return Object.keys(elems).map((id) => {
    const props = {
      [propName]: id,
      globalEvents: globalEvents
    };

    const $target = dom.querySelector(`#${id}`);

    render(
      <Provider store={store}>
        <Component {...props} />
      </Provider>,
      $target
    );

    return $target;
  });
}

