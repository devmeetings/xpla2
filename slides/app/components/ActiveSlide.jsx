import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import {initializeSlide} from '../slide/slide';

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
    initializeSlide(this._element, props.runServerUrl);
  }

  removeDomNode () {
    while (this._element.hasChildNodes()) {
      this._element.removeChild(this._element.childNodes[0]);
    }
  }

  render () {
    return (
      <div ref={(c) => this._element = c}></div>
    );
  }
}

ActiveSlide.propTypes = {
  slide: React.PropTypes.object.isRequired,
  runServerUrl: React.PropTypes.string.isRequired
};


