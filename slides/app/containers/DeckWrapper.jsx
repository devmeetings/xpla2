import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import * as DeckActions from '../actions/deck';

import {ActiveSlide} from '../components/ActiveSlide';
import {SlidesList} from '../components/SlidesList';

class DeckContainer extends React.Component {

  onSlideChange (slide) {
    this.props.actions.deckSlideChange({
      newSlideId: slide.get('id')
    });
  }

  render () {
    return (
      <div>
        <h1>Deck</h1>
        <ActiveSlide
          runServerUrl={this.props.runServerUrl}
          slide={this.props.activeSlide.get('content')}
          />
        <SlidesList
          active={this.props.activeSlide}
          slides={this.props.slides}
          onSlideChange={this.onSlideChange.bind(this)}
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
