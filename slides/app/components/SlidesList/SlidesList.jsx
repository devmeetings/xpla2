import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

export class SlidesList extends React.Component {

  renderSlides () {
    return this.props.slides.map((slide) => {
      return (
        <li
          style={{
            display: 'inline-block'
          }}
          key={slide.get('id')}
        >
          <a onClick={this.props.onSlideChange.bind(this, slide)}>
            {slide.get('title')}
          </a>
        </li>
      );
    });
  }

  render () {
    return (
      <ul style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0
      }}>
        {this.renderSlides()}
      </ul>
    );
  }
}

SlidesList.propTypes = {
  slides: Props.listOf(Props.contains({
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  })),
  onSlideChange: React.PropTypes.func.isRequired
};
