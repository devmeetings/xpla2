import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import {initializeSlide} from '../../slide/slide';

import styles from './ActiveSlide.scss';

export class ActiveSlide extends React.Component {

  componentDidMount () {
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
    this._destroyPreviousSlide = initializeSlide(this._element, props.runServerUrl);
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

ActiveSlide.propTypes = {
  slide: React.PropTypes.object.isRequired,
  runServerUrl: React.PropTypes.string.isRequired
};


