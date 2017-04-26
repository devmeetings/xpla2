// @flow

import React from 'react'
import Props from 'react-immutable-proptypes'

export function readUrl () {
  const url = window.location.hash.substring(1)
  const [slide, annotation] = url.split('/')
  let anno = parseInt(annotation, 10)
  return {
    slide: slide,
    annotation: isNaN(anno) ? -1 : anno
  }
}

export function getSlideId (slide: any) {
  return slide.shortName || slide.get('shortName')
}

export class DeckLocationUpdater extends React.Component {
  componentDidMount () {
    window.addEventListener('hashchange', this.locationListener)

    this.writeHash(this.getActive(this.props))
  }

  componentWillUnmount () {
    window.removeEventListener('hashchange', this.locationListener)
  }

  readHash () {
    return readUrl()
  }

  writeHash ({slide, annotation}: {slide: string, annotation: number}) {
    window.location.hash = `#${slide}${annotation > -1 ? '/' + annotation : ''}`
  }

  getActive (props: { active: any }) {
    return {
      slide: getSlideId(props.active),
      annotation: props.active.get('annotation')
    }
  }

  locationListener = () => {
    // Read current URL and send event if necessary
    const hash = this.readHash()
    const active = this.getActive(this.props)
    if (hash.slide === active.slide && hash.annotation === active.annotation) {
      return
    }
    // Notify changed
    this.props.onUrlChange(hash)
  };

  componentWillReceiveProps (newProps: { active: any }) {
    // update Active
    const active = this.getActive(newProps)
    const read = this.readHash()
    if (read.slide !== active.slide || read.annotation !== active.annotation) {
      this.writeHash(active)
    }
  }

  render () {
    return null
  }
}

DeckLocationUpdater.propTypes = {
  active: Props.contains({
    shortName: React.PropTypes.string.isRequired
  }).isRequired,
  onUrlChange: React.PropTypes.func.isRequired
}
