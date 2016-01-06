import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import {initializeSlide} from '../../slide/slide';

import styles from './DeckActiveSlide.scss';

export class DeckActiveSlide extends React.Component {

  componentDidMount () {
    this._destroyPreviousSlide = () => {};
    this.renderDomNode(this.props);
  }

  componentWillUnmount () {
    this.removeDomNode();
  }

  componentWillReceiveProps (newProps) {
    this.removeDomNode();
    this.renderDomNode(newProps);
  }

  renderDomNode (props) {
    const clone = props.slide.cloneNode(true);
    this._element.appendChild(clone);
    // Initialize slide content
    initializeSlide(this._element, props.runServerUrl).then((destroy) => {
      this._destroyPreviousSlide = destroy;
    });
  }

  removeDomNode () {
    this._destroyPreviousSlide();
    while (this._element.hasChildNodes()) {
      this._element.removeChild(this._element.childNodes[0]);
    }
  }

  render () {
    return (
      <div
        className={styles.slide}
        ref={(c) => this._element = c}>
      </div>
    );
  }
}

DeckActiveSlide.propTypes = {
  slide: React.PropTypes.object.isRequired,
  runServerUrl: React.PropTypes.string.isRequired
};


