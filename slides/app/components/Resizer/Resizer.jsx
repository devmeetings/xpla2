import React from 'react';
import Props from 'react-immutable-proptypes';
import _ from 'lodash';

import styles from './Resizer.scss';

const CLASS_NAME_V = 'xp-resize-column';
const CLASS_NAME_V2 = 'xp-resize-col';
const CLASS_NAME_H = 'xp-resize-row';

export function resizer(target) {
  target.addEventListener('mousedown', startResize);

  return () => {
    target.removeEventListener('mousedown', startResize);
  };
}

function startResize (ev) {
  const clazz = ev.target.className;
  if (clazz !== CLASS_NAME_V && clazz !== CLASS_NAME_H && clazz !== CLASS_NAME_V2) {
    return;
  }
  const p = ev.target.parentNode;
  // Find next and prev
  const idx = [].indexOf.call(p.children, ev.target);

  const prev = idx > 0 ? p.children[idx - 1] : false;
  const next = idx + 1 < p.children.length ? p.children[idx + 1] : false;

  if (!next || !prev) {
    console.warn('Trying to use resize, but no nodes found.', ev.target);
    return;
  }

  // Add overlay
  const overlay = new Overlay(p, clazz);
  overlay.d.addEventListener('mousemove', (ev) => {
    let pos = overlay.calculatePos(ev);
    let prop = overlay.getProp();
    prev.style[prop] = `${pos * 100}%`;
    next.style[prop] = `${(1-pos) * 100}%`;
  });

  overlay.d.addEventListener('mouseup', () => {
    overlay.remove();
  });
}

class Overlay {
  constructor (p, clazz) {
    this.p = p;
    this.clazz = clazz;
    this.d = document.createElement('div');
    this.d.className = `${styles.overlay} ${clazz === CLASS_NAME_H ? styles.overlayH : styles.overlayV}`;
    this.p.appendChild(this.d);
  }

  getProp () {
    if (this.clazz === CLASS_NAME_H) {
      return 'height';
    }
    return 'width';
  }

  calculatePos (ev) {
    if (this.clazz === CLASS_NAME_H) {
      return ev.offsetY / this.d.offsetHeight;
    }

    return ev.offsetX / this.d.offsetWidth;
  }

  remove () {
    this.p.removeChild(this.d);
  }
}
