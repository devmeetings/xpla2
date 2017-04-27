// @flow

import React from 'react'

import {initializeSlide} from '../../slide/slide'
import {slideChangeAnnotation} from '../../actions/slide'
import {cast} from '../../assert'

import styles from './DeckActiveSlide.scss'

type PropsT = {
  slide: HTMLElement,
  runServerUrl: ?string,
  presenceServerUrl: ?string,
  title: string,
  path: string,
  annotation: number,
};

type StoreT = {
  dispatch: (any) => void
};

type DestroyT = {
  destroy: () => void,
  events: any,
  store: ?StoreT
};

export class DeckActiveSlide extends React.Component {
  _previousElement = cast({});
  _element = cast({});
  _destroyPreviousSlide: DestroyT = {
    store: null,
    events: null,
    destroy () {}
  };

  componentDidMount () {
    this._destroyPreviousSlide = {
      store: null,
      events: null,
      destroy () {}
    }
    this.renderDomNode(this.props)
    this.props.slideEvents.on('play.slideAction', this.playSlideAction)
  }

  componentWillUnmount () {
    this.destroyPreviousSlide()
    while (this._element.hasChildNodes()) {
      this._element.removeChild(this._element.childNodes[0])
    }
    this.props.slideEvents.off('play.slideAction', this.playSlideAction)
  }

  playSlideAction = (action: any) => {
    if (this._destroyPreviousSlide.store) {
      this._destroyPreviousSlide.store.dispatch(action)
    }
  }

  componentWillReceiveProps (newProps: any) {
    const isDifferent = Object.keys(newProps).filter(key => key !== 'annotation').find(key => newProps[key] !== this.props[key])
    if (!isDifferent) {
      if (newProps.annotation !== this.props.annotation) {
        // Update annotation
        const store = this._destroyPreviousSlide.store
        if (store) {
          store.dispatch(slideChangeAnnotation(newProps.annotation))
        }
      }
      return
    }

    this.destroyPreviousSlide()
    this.renderDomNode(newProps)
  }

  destroyPreviousSlide () {
    // First copy to prevContainer
    while (this._element.hasChildNodes()) {
      this._previousElement.appendChild(this._element.childNodes[0])
    }
    // Then start animation and destroy previous slide
    this._previousElement.classList.add(styles.hidden)
    // Remember destroy function now
    const destroyMe = this._destroyPreviousSlide

    setTimeout(() => {
      destroyMe.destroy()
      destroyMe.events.off('slide.next', this.props.onNextSlide)
      destroyMe.events.off('slide.prev', this.props.onPrevSlide)
      destroyMe.events.off('slide.annotation', this.props.onAnnotation)
      destroyMe.events.off('slide.forward', this.props.onSlideAction)

      while (this._previousElement.hasChildNodes()) {
        this._previousElement.removeChild(this._previousElement.childNodes[0])
      }
      this._previousElement.classList.remove(styles.hidden)
    }, 1000)
  }

  renderDomNode (props: PropsT) {
    const clone = props.slide.cloneNode(true)
    this._element.appendChild(clone)

    // Initialize slide content
    this._element.classList.add(styles.hidenow)
    initializeSlide(
      this._element,
      props.runServerUrl,
      props.presenceServerUrl,
      props.title,
      props.path,
      props.annotation
    ).then((destroy) => {
      this._element.classList.remove(styles.hidenow)
      // NOTE [ToDr] Make sure to unassign events!
      destroy.events.on('slide.next', this.props.onNextSlide)
      destroy.events.on('slide.prev', this.props.onPrevSlide)
      destroy.events.on('slide.annotation', this.props.onAnnotation)
      destroy.events.on('slide.forward', this.props.onSlideAction)
      this._destroyPreviousSlide = destroy
    }, (e) => {
      console.error('Error while loading slide.')
      console.error(e)
    })
  }

  onPreviousElement = (c: HTMLElement) => {
    this._previousElement = c
  }

  onElement = (c: HTMLElement) => {
    this._element = c
  }

  render () {
    return (
      <div className={styles.slideContainer}>
        <div
          className={styles.slide}
          ref={this.onPreviousElement}
          />
        <div
          className={styles.slide}
          ref={this.onElement}
          />
      </div>
    )
  }
}

DeckActiveSlide.propTypes = {
  title: React.PropTypes.string.isRequired,
  slide: React.PropTypes.object.isRequired,
  path: React.PropTypes.string.isRequired,
  runServerUrl: React.PropTypes.string.isRequired,
  presenceServerUrl: React.PropTypes.string,
  onAnnotation: React.PropTypes.func.isRequired,
  onNextSlide: React.PropTypes.func.isRequired,
  onPrevSlide: React.PropTypes.func.isRequired,
  onSlideAction: React.PropTypes.func.isRequired
}
