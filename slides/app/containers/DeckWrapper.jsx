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
          runServerUrl={this.props.runServerUrl}
          slide={this.props.activeSlide.get('content')}
          />
        <DeckSlidesList
          active={this.props.activeSlide}
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
    activeSlide: state.get('deck').get('active')
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
