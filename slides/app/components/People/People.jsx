// @flow

import React from 'react'
import Props from 'react-immutable-proptypes'
import classnames from 'classnames'

import Tooltip from '../Tooltip'

import styles from './People.scss'

export default class People extends React.Component {
  static propTypes = {
    slide: Props.map,
    slides: Props.list,
    presence: Props.contains({
      active: React.PropTypes.bool.isRequired,
      clients: Props.map.isRequired
    }).isRequired
  }

  state = {
    presence: {}
  }

  componentWillMount () {
    this.updateState(this.props.presence.get('clients'))
  }

  componentWillReceiveProps (nextProps: any) {
    const clients = nextProps.presence.get('clients')
    if (clients !== this.props.presence.get('clients')) {
      this.updateState(clients)
    }
  }

  updateState (clients: any) {
    const jsClients = clients.toJS()
    const presence = {}
    Object.keys(jsClients).map(client => {
      const { currentSlide, isActive } = jsClients[client]
      presence[currentSlide] = presence[currentSlide] || { active: 0, nonActive: 0 }
      if (isActive) {
        presence[currentSlide].active += 1
      } else {
        presence[currentSlide].nonActive += 1
      }
    })
    this.setState({ presence })
  }

  noOfPeople () {
    const { slide, slides } = this.props
    const { presence } = this.state

    if (slide) {
      return presence[slide.get('id')] || { active: 0, nonActive: 0 }
    }

    if (slides) {
      return slides.map(slide => slide.get('id')).reduce((memo, id) => {
        if (!presence[id]) {
          return memo
        }

        memo.active += presence[id].active
        memo.nonActive += presence[id].nonActive
        return memo
      }, { active: 0, nonActive: 0 })
    }

    return { active: 0, nonActive: 0 }
  }

  render () {
    const noOfPeople = this.noOfPeople()
    const presenceActive = this.props.presence.get('active') && (noOfPeople.active > 0 || noOfPeople.nonActive > 0)

    return presenceActive ? this.renderPeople(noOfPeople) : null
  }

  renderPeople (noOfPeople: {active: number, nonActive: number}) {
    const { active } = noOfPeople
    const total = active + noOfPeople.nonActive
    const plural = total > 1 ? 'persons' : 'person'
    const clazz = classnames(styles.people, {
      [styles.active]: active > 0,
      [styles.odd]: total % 2 !== 0,
      [styles.even]: total % 2 === 0
    })
    const text = (total === active || active === 0) ? total : `${active}/${total}`

    return (
      <Tooltip
        overlay={<span>{ total } { plural } on that slide ({active} active)</span>}
        placement={'top'}
        >
        <span className={clazz}>
          {text}
        </span>
      </Tooltip>
    )
  }
}
