// @flow

import {bindActionCreators} from 'redux'
import React from 'react'
import {connect} from 'react-redux'

import * as DeckActions from '../actions/deck'

import {DeckActiveSlide} from '../components/DeckActiveSlide/DeckActiveSlide'
import {DeckSlidesList} from '../components/DeckSlidesList/DeckSlidesList'
import {DeckLocationUpdater, getSlideId} from '../components/DeckLocationUpdater/DeckLocationUpdater'
import {DeckRecordings} from '../components/DeckRecordings'

import styles from './DeckWrapper.scss'

class DeckContainer extends React.Component {
  componentDidMount () {
    window.addEventListener('keyup', this.onKey)
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.onKey)
  }

  onKey = (ev) => {
    const prevPage = [33]/* PGUP */
    const nextPage = [34]/* PGDOWN */
    const code = ev.keyCode

    if (prevPage.indexOf(code) !== -1) {
      this.prevSlide()
      return
    }

    if (nextPage.indexOf(code) !== -1) {
      this.nextSlide()
    }
  };

  annotation = (annotation = -1) => {
    this.props.actions.deckSlideChange({
      newSlideId: this.props.activeSlide.get('id'),
      annotation
    })
  };

  nextSlide = () => {
    let activeId = this.props.activeSlide.get('id')
    let idx = this.props.slides.findIndex(slide => slide.get('id') === activeId)
    if (idx + 1 >= this.props.slides.size) {
      return
    }

    this.onSlideChange(this.props.slides.get(idx + 1))
  };

  prevSlide = () => {
    let activeId = this.props.activeSlide.get('id')
    let idx = this.props.slides.findIndex(slide => slide.get('id') === activeId)
    if (idx - 1 < 0) {
      return
    }

    this.onSlideChange(this.props.slides.get(idx - 1))
  };

  onSlideAction = (action) => {
    action.payload.slideId = this.props.activeSlide.get('id')
    this.props.actions.slideAction(action)
  };

  onSlideChange = (slide) => {
    this.props.actions.deckSlideChange({
      newSlideId: slide.get('id'),
      annotation: -1
    })
  };

  onSlideUrlChange = ({slide, annotation = -1}) => {
    const s = this.props.slides.find((s) => getSlideId(s) === slide)
    if (!s) {
      return
    }

    this.props.actions.deckSlideChange({
      newSlideId: s.get('id'),
      annotation
    })
  };

  render () {
    return (
      <div
        className={styles.deck}
        >
        <DeckLocationUpdater
          active={this.props.activeSlide}
          onUrlChange={this.onSlideUrlChange}
          />
        <DeckRecordings
          onPlayAction={this.props.actions.playAction}
          onReset={this.props.actions.resetRecordings}
          onSetRecordings={this.props.actions.setRecordings}
          onToggleState={this.props.actions.toggleRecordingState}
          onToggleView={this.props.actions.toggleRecordingView}
          recordings={this.props.recordings}
          />
        <DeckActiveSlide
          annotation={this.props.activeSlide.get('annotation')}
          onAnnotation={this.annotation}
          onNextSlide={this.nextSlide}
          onPrevSlide={this.prevSlide}
          onSlideAction={this.onSlideAction}
          path={this.props.activeSlide.get('path')}
          presenceServerUrl={this.props.presenceServerUrl}
          runServerUrl={this.props.runServerUrl}
          slide={this.props.activeSlide.get('content')}
          slideEvents={this.props.slideEvents}
          title={this.props.activeSlide.get('title')}
          />
        <DeckSlidesList
          active={this.props.activeSlide}
          back={this.props.back}
          onSlideChange={this.onSlideChange}
          presence={this.props.presence}
          slides={this.props.slides}
        />
      </div>
    )
  }
}

DeckContainer.propTypes = {
  actions: React.PropTypes.shape({
    deckSlideChange: React.PropTypes.func.isRequired
  }).isRequired
}

@connect(
  state => ({
    runServerUrl: state.get('runServerUrl'),
    presenceServerUrl: state.get('presenceServerUrl'),
    slides: state.get('deck').get('slides'),
    activeSlide: state.get('deck').get('active'),
    back: state.get('deck').get('back'),
    recordings: state.get('recordings'),
    presence: state.get('presence')
  }),
  dispatch => ({
    actions: bindActionCreators(DeckActions, dispatch)
  })
)
export default class DeckContainerWrapper extends React.Component {
  render () {
    return (
      <DeckContainer {...this.props} />
    )
  }
}
