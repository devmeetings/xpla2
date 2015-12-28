import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import styles from './SlidesList.scss';

export class SlidesList extends React.Component {

  renderSlides () {
    const activeId = this.props.active.get('id');

    return this.props.slides.map((slide) => {
      const id = slide.get('id');
      return (
        <li
          className={id === activeId ? styles.itemActive : styles.item}
          key={id}
        >
          <a
            onClick={this.props.onSlideChange.bind(this, slide)}>
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
  active: Props.contains({
    id: React.PropTypes.string.isRequired,
  }),
  slides: Props.listOf(Props.contains({
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  })).isRequired,
  onSlideChange: React.PropTypes.func.isRequired
};
