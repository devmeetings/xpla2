// @flow

import _ from 'lodash';
import React from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {Provider} from 'react-redux';
import EventEmitter from 'event-emitter';

import { slideStore } from '../store';
import {getEditorState} from '../components/read/EditorState';
import {getPreviewState} from '../components/read/PreviewState';
import {getAnnotationState} from '../components/read/AnnotationsMetaState';
import {getTimerState} from '../components/read/TimerState';
import {getTasksState} from '../components/read/TasksState';
import {readTitle} from '../components/read/SlideState';

import EditorWrapper from '../containers/EditorWrapper';
import PreviewWrapper from '../containers/PreviewWrapper';
import AnnotationsWrapper from '../containers/AnnotationsWrapper';
import TimerWrapper from '../containers/TimerWrapper';
import TasksWrapper from '../containers/TasksWrapper';
import {isSmallScreen} from '../components/isSmallScreen';

import './slide.scss';

export function initializeSlide(dom: Element, runServerUrl: ?string, presenceServerUrl: ?string, defaultTitle: ?string, path: string = '') {
  if (!dom) {
    throw new Error('Provide DOM element!');
  }

  if (!runServerUrl) {
    throw new Error('RunServerUrl is missing.');
  }

  // Hide address bar on mobile hack
  if (isSmallScreen()) {
    window.scrollTo(0,1);
  }

  const title = readTitle(dom.parentNode) || defaultTitle;
  const annotations = getIfExists(dom, 'xp-annotations', getAnnotationState)
  annotations.title = title;

  const timer = getIfExists(dom, 'xp-timer', getTimerState);
  const tasks = getIfExists(dom, 'xp-tasks', getTasksState);
  const editorsP = getAsMap(dom, 'xp-editor', (dom) => getEditorState(dom, path));
  const previewsP = getAsMap(dom, 'xp-preview', getPreviewState);

  return Promise.all([editorsP, previewsP])
    .then((a) => {
      const [editors, previews] = a;

      const store = slideStore({
        editors, previews, runServerUrl, presenceServerUrl, annotations, timer, tasks
      });

      const globalEvents = new EventEmitter({});

      const $annotations = renderComponent(dom.querySelector('xp-annotations'), globalEvents, store, annotations, AnnotationsWrapper);
      const $timer = renderComponent(dom.querySelector('xp-timer'), globalEvents, store, timer, TimerWrapper);
      const $tasks = renderComponent(dom.querySelector('xp-tasks'), globalEvents, store, tasks, TasksWrapper);
      const $editors = renderComponents(dom, globalEvents, store, editors, EditorWrapper, 'editorId');
      const $previews = renderComponents(dom, globalEvents, store, previews, PreviewWrapper, 'previewId');

      return {
        events: globalEvents,
        destroy: destroyFunction(
          [$annotations]
          .concat($editors)
          .concat($previews)
          .concat($timer)
          .concat($tasks)
        )
      };
    });
}

function destroyFunction ($elems) {
  return () => {
    $elems.filter(x => x).map(unmountComponentAtNode);
  };
}

function getIfExists (dom, query, mapper) {
  const elem = dom.querySelector(query);
  return mapper(elem || dom, dom);
}

function getAsMap (dom, query, mapper) {
  const elems = _
    .chain(dom.querySelectorAll(query))
    .map(mapper)
    .value();

  return Promise.all(elems).then((elemsResolved) => {
    return _.keyBy(elemsResolved, 'id');
  });
}

function renderComponent($target, globalEvents, store, elem, Component) {
  if (!$target) {
    return;
  }

  const props = {globalEvents};

  render(
    <Provider store={store}>
      <Component {...props} />
    </Provider>,
    $target
  );

  return $target;
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

