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
    this.destroyPreviousSlide();
    while (this._element.hasChildNodes()) {
      this._element.removeChild(this._element.childNodes[0]);
    }
  }

  componentWillReceiveProps (newProps) {
    this.destroyPreviousSlide();
    this.renderDomNode(newProps);
  }

  destroyPreviousSlide () {
    // First copy to prevContainer
    while (this._element.hasChildNodes()) {
      this._previousElement.appendChild(this._element.childNodes[0]);
    }
    // Then start animation and destroy previous slide
    this._previousElement.classList.add(styles.hidden);
    // Remember destroy function now
    const destroyMe = this._destroyPreviousSlide;

    setTimeout(() => {
      destroyMe();
      while(this._previousElement.hasChildNodes()) {
        this._previousElement.removeChild(this._previousElement.childNodes[0]);
      }
      this._previousElement.classList.remove(styles.hidden);
    }, 1000);
  }

  renderDomNode (props) {
    const clone = props.slide.cloneNode(true);
    this._element.appendChild(clone);
    // Initialize slide content

    this._element.classList.add(styles.hidenow);
    initializeSlide(this._element, props.runServerUrl).then((destroy) => {
      this._element.classList.remove(styles.hidenow);
      this._destroyPreviousSlide = destroy;
    }, () => console.error('Error while loading slide.'));
  }

  render () {
    return (
      <div className={styles.slideContainer}>
        <div
          className={styles.slide}
          ref={(c) => this._previousElement = c}
          >
        </div>
        <div
          className={styles.slide}
          ref={(c) => this._element = c}>
        </div>
      </div>
    );
  }
}

DeckActiveSlide.propTypes = {
  slide: React.PropTypes.object.isRequired,
  runServerUrl: React.PropTypes.string.isRequired
};


