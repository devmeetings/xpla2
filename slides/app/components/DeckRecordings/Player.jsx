// @flow

import React from 'react'
import Props from 'react-immutable-proptypes'

import {STATE_PLAYING} from '../../reducers.utils/recordings'
import styles from './DeckRecordings.scss'

import {Icon} from '../Icon/Icon'
import {nonNull, cast} from '../../assert'

export class PlayerInterface extends React.Component {
  static propTypes = {
    onPlayAction: React.PropTypes.func.isRequired,
    onToggleState: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    recordings: Props.contains({
      view: React.PropTypes.string.isRequired,
      state: React.PropTypes.string.isRequired
    }).isRequired,
    position: React.PropTypes.number.isRequired,
    speed: React.PropTypes.number.isRequired
  };

  updatePosition = (ev: Event) => {
    const position = parseInt(cast(ev.target).value, 10)
    this.props.onChange({position})
  }

  updateSpeed = (ev: Event) => {
    const speed = parseInt(cast(ev.target).value, 10)
    this.props.onChange({speed})
  }

  onToggleState = () => {
    this.props.onToggleState(true)
  }

  isPlaying (props: any = this.props) {
    return props.recordings.get('state') === STATE_PLAYING
  }

  render () {
    return (
      <div className={styles.clear}>
        Time [ms]:
        <input
          className={styles.smallInput}
          type='number'
          placeholder='Position'
          value={this.props.position}
          onChange={this.updatePosition}
        />

        Speed [1x]:
        <input
          className={styles.smallInput}
          type='number'
          placeholder='Speed'
          value={this.props.speed}
          onChange={this.updateSpeed}
        />

        {this.isPlaying() ? (
          <button className={styles.button} onClick={this.onToggleState}>
            <Icon icon='pause' /> Pause
          </button>
        ): (
          <button className={styles.button} onClick={this.onToggleState}>
            <Icon icon='play' /> Play
          </button>
        )}
      </div>
    );
  }
}

export class Player extends React.Component {
  static propTypes = {
    onChange: React.PropTypes.func.isRequired,
    onPlayAction: React.PropTypes.func.isRequired,
    onToggleState: React.PropTypes.func.isRequired,
    recordings: Props.contains({
      view: React.PropTypes.string.isRequired,
      state: React.PropTypes.string.isRequired
    }).isRequired,
    position: React.PropTypes.number.isRequired,
    speed: React.PropTypes.number.isRequired
  };

  lastTick: ?number = null
  timeout: number = 0

  onToggleState = () => {
    this.props.onToggleState(true)
  }

  doTick = (force: boolean = false) => {
    // Do nothing if not playing
    if (!this.isPlaying() && !force) {
      return
    }

    const {position, speed} = this.props
    const rec = this.props.recordings.get('recordings');
    const entry = rec.findEntry(rec => rec.get('timestamp') > position)

    if (!entry) {
      // Disable play mode (finished)
      this.onToggleState()
      return
    }

    if (speed <= 0) {
      window.alert('Invalid speed, aborting!')
      this.onToggleState()
      return
    }

    const [key, nextRecording] = entry
    // Update position
    const newPosition = nextRecording.get('timestamp')
    this.props.onChange({
      position: newPosition
    })

    // Trigger action
    if (key > 0) {
      const currentRec = rec.get(key - 1);
      this.props.onPlayAction(currentRec.get('action').toJS())
    }

    // Schedule next tick
    setTimeout(this.doTick, (newPosition - position) / speed)
  }

  isPlaying (props: any = this.props) {
    return props.recordings.get('state') === STATE_PLAYING
  }

  componentWillReceiveProps (newProps: any) {
    const playingNow = this.isPlaying();
    const willPlay = this.isPlaying(newProps);
    // Turn on playing
    if (!playingNow && willPlay) {
      this.doTick(true)
      return
    }

    // Turn off playing
    if (playingNow && !willPlay) {
      clearTimeout(this.timeout)
      return
    }
  }

  render () {
    return null
  }
}
