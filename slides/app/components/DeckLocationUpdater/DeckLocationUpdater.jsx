import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

export function readUrl () {
  return window.location.hash.substring(1);
}

export function getSlideId (slide) {
  return slide.shortName || slide.get('shortName');
}

export class DeckLocationUpdater extends React.Component {

  constructor (...args) {
    super(...args);
    this.locationListener = this.locationListener.bind(this);
  }

  componentDidMount () {
    window.addEventListener('hashchange', this.locationListener);

    this.writeHash(this.getActiveId(this.props));
  }

  componentWillUnmount () {
    window.removeEventListener('hashchange', this.locationListener);
  }

  readHash () {
    return readUrl();
  }

  writeHash (val) {
    window.location.hash = `#${val}`;
  }

  getActiveId (props) {
    return getSlideId(props.active);
  }

  locationListener () {
    // Read current URL and send event if necessary
    const hash = this.readHash();
    const activeId = this.getActiveId(this.props);
    if (hash === activeId) {
      return;
    }
    // Notify changed
    this.props.onUrlChange(hash);
  }

  componentWillReceiveProps (newProps) {
    // update Active
    const activeId = this.getActiveId(newProps);
    if (this.readHash() != activeId) {
      this.writeHash(activeId);
    }
  }

  render () {
    return (
      <span />
    );
  }
}

DeckLocationUpdater.propTypes = {
  active: Props.contains({
    shortName: React.PropTypes.string.isRequired,
  }).isRequired,
  onUrlChange: React.PropTypes.func.isRequired
};


