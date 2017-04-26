// @flow

import styles from './Resizer.scss'
import {nonNull, cast} from '../../assert'

const CLASS_NAME_V = 'xp-resize-column'
const CLASS_NAME_V2 = 'xp-resize-col'
const CLASS_NAME_H = 'xp-resize-row'

export function resizer (target: HTMLElement) {
  target.addEventListener('mousedown', startResize)

  return () => {
    target.removeEventListener('mousedown', startResize)
  }
}

function startResize (ev: MouseEvent) {
  const target: HTMLElement = cast(ev.target)
  const clazz = target.className
  if (clazz !== CLASS_NAME_V && clazz !== CLASS_NAME_H && clazz !== CLASS_NAME_V2) {
    return
  }
  const p: HTMLElement = cast(nonNull(target.parentNode))
  const children = nonNull(p.children)
  // Find next and prev
  const idx = [].indexOf.call(children, target)

  const prev = idx > 0 ? children[idx - 1] : false
  const next = idx + 1 < children.length ? children[idx + 1] : false

  if (!next || !prev) {
    console.warn('Trying to use resize, but no nodes found.', target)
    return
  }

  // Add overlay
  const overlay = new Overlay(p, clazz)
  overlay.d.addEventListener('mousemove', (ev: MouseEvent) => {
    let pos = overlay.calculatePos(ev)
    let prop = overlay.getProp()
    prev.style[prop] = `${pos * 100}%`
    next.style[prop] = `${(1 - pos) * 100}%`
  })

  overlay.d.addEventListener('mouseup', () => {
    overlay.remove()
  })
}

class Overlay {
  p: HTMLElement;
  d: HTMLElement;
  clazz: string;

  constructor (p, clazz) {
    this.p = p
    this.clazz = clazz
    this.d = p.ownerDocument.createElement('div')
    this.d.className = `${styles.overlay} ${clazz === CLASS_NAME_H ? styles.overlayH : styles.overlayV}`
    this.p.appendChild(this.d)
  }

  getProp (): any {
    if (this.clazz === CLASS_NAME_H) {
      return 'height'
    }
    return 'width'
  }

  calculatePos (ev) {
    if (this.clazz === CLASS_NAME_H) {
      return ev.offsetY / this.d.offsetHeight
    }

    return ev.offsetX / this.d.offsetWidth
  }

  remove () {
    this.p.removeChild(this.d)
  }
}
