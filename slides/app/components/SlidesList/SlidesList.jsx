import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import styles from './SlidesList.scss';


export class SlidesList extends React.Component {

  renderSlides () {
    return this.props.slides.map((slide) => {
      return (
        <li
          className={styles.item}
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
      <ul
        className={styles.list}
      >
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
