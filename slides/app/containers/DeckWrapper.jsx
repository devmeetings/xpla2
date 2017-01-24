import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import * as DeckActions from '../actions/deck';

import {DeckActiveSlide} from '../components/DeckActiveSlide/DeckActiveSlide';
import {DeckSlidesList} from '../components/DeckSlidesList/DeckSlidesList';
import {DeckLocationUpdater, getSlideId} from '../components/DeckLocationUpdater/DeckLocationUpdater';

import styles from './DeckWrapper.scss';

class DeckContainer extends React.Component {

  constructor (...args) {
    super(...args);
    this.onKey = this.onKey.bind(this);
  }

  componentDidMount () {
    window.addEventListener('keyup', this.onKey);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.onKey);
  }

  onKey (ev) {
    const prevPage = [33/* PGUP */];
    const nextPage = [34/* PGDOWN */];
    const code = ev.keyCode;

    if (prevPage.indexOf(code) !== -1) {
      this.prevSlide();
      return;
    }

    if (nextPage.indexOf(code) !== -1) {
      this.nextSlide();
      return;
    }
  }

  nextSlide () {
    let active = this.props.activeSlide;
    let idx = this.props.slides.indexOf(active);
    if (idx + 1 >= this.props.slides.size) {
      return;
    }
    this.onSlideChange(this.props.slides.get(idx + 1));
  }

  prevSlide () {
    let active = this.props.activeSlide;
    let idx = this.props.slides.indexOf(active);
    if (idx - 1 < 0) {
      return;
    }
    this.onSlideChange(this.props.slides.get(idx - 1));
  }

  onSlideChange (slide) {
    this.props.actions.deckSlideChange({
      newSlideId: slide.get('id')
    });
  }

  onSlideUrlChange (slideUrlId) {
    const slide = this.props.slides.find((slide) => getSlideId(slide) === slideUrlId);
    if (!slide) {
      return;
    }
    this.props.actions.deckSlideChange({
      newSlideId: slide.get('id')
    });
  }

  render () {
    return (
      <div
        className={styles.deck}
        >
        <DeckLocationUpdater
          active={this.props.activeSlide}
          onUrlChange={this.onSlideUrlChange.bind(this)}
          />
        <DeckActiveSlide
          onNextSlide={this.nextSlide.bind(this)}
          onPrevSlide={this.prevSlide.bind(this)}
          path={this.props.activeSlide.get('path')}
          runServerUrl={this.props.runServerUrl}
          slide={this.props.activeSlide.get('content')}
          title={this.props.activeSlide.get('title')}
          />
        <DeckSlidesList
          active={this.props.activeSlide}
          back={this.props.back}
          onSlideChange={this.onSlideChange.bind(this)}
          slides={this.props.slides}
        />
      </div>
    );
  }

}

DeckContainer.propTypes = {
  actions: React.PropTypes.shape({
    deckSlideChange: React.PropTypes.func.isRequired
  }).isRequired
};

@connect(
  state => ({
    runServerUrl: state.get('runServerUrl'),
    slides: state.get('deck').get('slides'),
    activeSlide: state.get('deck').get('active'),
    back: state.get('deck').get('back')
  }),
  dispatch => ({
    actions: bindActionCreators(DeckActions, dispatch)
  })
)
export default class DeckContainerWrapper extends React.Component {
  render() {
    return (
      <DeckContainer {...this.props} />
    )
  }
}
DeckContainerWrapper.propTypes = {
};
