import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import {Icon} from '../Icon/Icon';
import Tooltip from '../Tooltip';

import styles from './DeckSlidesList.scss';

const DEFAULT_NO_OF_SLIDES = 3;

export class DeckSlidesList extends React.Component {

  constructor (...args) {
    super(...args);
    this.state = {
      noOfSlidesToShow: DEFAULT_NO_OF_SLIDES
    };
  }

  showMore = () => {
    this.setState({
      noOfSlidesToShow: this.state.noOfSlidesToShow + DEFAULT_NO_OF_SLIDES
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.active != this.props.active) {
      this.setState({
        noOfSlidesToShow: DEFAULT_NO_OF_SLIDES
      });
      this._list.scrollLeft = 0;
    }
  }

  getSplittedSlides() {
    const noOfSlidesBeforeActive = this.state.noOfSlidesToShow;
    const slides = this.props.slides;
    const activeId = this.props.active.get('id');
    const isActiveSlide = (slide) => slide.get('id') === activeId;

    const beforeAll = slides.takeUntil(isActiveSlide);
    const before = beforeAll.takeLast(noOfSlidesBeforeActive);

    const after = slides.skipUntil(isActiveSlide);
    const hasMore = before.size !== beforeAll.size;

    return {
      before, after, hasMore
    };
  }

  renderMoreSlidesButton (hasMore) {
    if (!hasMore) {
      return;
    }

    return (
      <li className={styles.itemMore} key={'button'}>
        <a onClick={this.showMore}>
          <Tooltip
            overlay={<span>Show more slides</span>}
            placement={'top'}
            >
            <div>
              <Icon icon={'more-horiz'} size={'1em'} />
            </div>
          </Tooltip>
        </a>
      </li>
    );
  }

  renderSlide (slide) {
    const activeId = this.props.active.get('id');
    const id = slide.get('id');

    return (
      <li
        className={id === activeId ? styles.itemActive : styles.item}
        key={id}
      >
        {this.renderSlideLink(slide)}
      </li>
    );
  }

  renderSlideLink (slide) {
    const link = (
        <a
          onClick={this.props.onSlideChange.bind(this, slide)}>
          {slide.get('name')}
        </a>
    );

    if (slide.get('name').length < 20) {
      return link;
    }

    return (
        <Tooltip
          overlay={<span>{slide.get('title')}</span>}
          placement={'top'}
          >
          {link}
        </Tooltip>
    );
  }

  renderSlides (slides) {
    return slides.map((slide) => this.renderSlide(slide));
  }

  render () {
    const slides = this.getSplittedSlides();

    return (
      <ul
        className={styles.list}
        ref={(ul) => this._list = ul}
        >
        {this.renderMoreSlidesButton(slides.hasMore)}
        {this.renderSlides(slides.before)}
        {this.renderSlides(slides.after)}
      </ul>
    );
  }
}

DeckSlidesList.propTypes = {
  active: Props.contains({
    id: React.PropTypes.string.isRequired,
  }),
  slides: Props.listOf(Props.contains({
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  })).isRequired,
  onSlideChange: React.PropTypes.func.isRequired
};
