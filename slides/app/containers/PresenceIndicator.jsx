// @flow

import React from 'react'
import Props from 'react-immutable-proptypes'
import {connect} from 'react-redux'

import People from '../components/People'

class PresenceIndicator extends React.Component {
  static propTypes = {
    slide: Props.map,
    slides: Props.list,
    presence: Props.map.isRequired
  }

  render () {
    const { slide, slides, annotation, presence } = this.props

    return (
      <People
        annotation={annotation}
        presence={presence}
        slide={slide}
        slides={slides}
      />
    )
  }
}

@connect(
  state => ({
    presence: state.get('presence')
  })
)
export default class PresenceIndicatorWrapper extends React.Component {
  render () {
    return (
      <PresenceIndicator {...this.props} />
    )
  }
}
