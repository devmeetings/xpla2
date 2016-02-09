import {randomId} from './utils';

function getHtml(dom, field) {
  let elem = dom.querySelector(field);
  if (elem) {
    return elem.innerHTML;
  }
  return '';
}

function readAnnotation(dom) {
  const file = dom.getAttribute('file');
  const order = parseInt(dom.getAttribute('order'), 10);

  return {
    file,
    order,
    content: dom.innerHTML
  };
}

function readAnnotations(dom, prop) {
  return _(dom.querySelectorAll(prop))
    .map(readAnnotation)
    .groupBy('file')
    .value()
}

export function getAnnotationState (dom) {
  const header = getHtml(dom, 'header');
  const details = getHtml(dom, 'details');
  const annotations = readAnnotations(dom, 'aside');

  return {
    header,
    details,
    annotations
  };
}
