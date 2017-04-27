// @flow

import React from 'react'
import Props from 'react-immutable-proptypes'
import classnames from 'classnames'
import parser from 'subtitles-parser'
import Dropzone from 'react-dropzone'

import {VIEW_NORMAL, STATE_RECORDING, STATE_PLAYING} from '../../reducers.utils/recordings'
import styles from './DeckRecordings.scss'

import Modal from 'react-modal'
import {Icon} from '../Icon/Icon'
import {Player, PlayerInterface} from './Player';
import {saveFile} from '../../reducers.utils/saveFile'
import {nonNull} from '../../assert'

export class DeckRecordings extends React.Component {
  dropZone: any

  static propTypes = {
    onToggleState: React.PropTypes.func.isRequired,
    onToggleView: React.PropTypes.func.isRequired,
    onReset: React.PropTypes.func.isRequired,
    onSetRecordings: React.PropTypes.func.isRequired,
    recordings: Props.contains({
      view: React.PropTypes.string.isRequired,
      state: React.PropTypes.string.isRequired
    }).isRequired
  }

  state = {
    playPosition: 0,
    playSpeed: 1
  }

  updatePlayState = (data: any) => {
    const {position, speed} = data
    this.setState({
      playPosition: position === undefined ? this.state.playPosition : position,
      playSpeed: speed === undefined ? this.state.playSpeed : speed
    })
  }

  componentDidMount () {
    window.addEventListener('keyup', this.onKey)
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.onKey)
  }

  onKey = (ev: KeyboardEvent) => {
    const toggleView = [66]/* B */
    const toggleState = [190]/* . */
    const togglePlayState = [188]/* , */

    const code = ev.keyCode
    const ctrl = ev.ctrlKey || ev.metaKey

    if (ctrl && toggleView.indexOf(code) !== -1) {
      this.props.onToggleView()
      return
    }

    if (ctrl && toggleState.indexOf(code) !== -1) {
      this.props.onToggleState(false)
    }

    if (ctrl && togglePlayState.indexOf(code) !== -1) {
      this.props.onToggleState(true)
    }
  }

  toggleRecordingState = () => {
    this.props.onToggleState(false)
  }

  uploadSrt = (files: Array<File>) => {
    const file = files[0]
    if (!file) {
      window.alert('No file!')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const srt = parser.fromSrt(e.target.result, true)
        const recordings = srt.map(rec => {
          return {
            timestamp: rec.startTime,
            action: JSON.parse(rec.text)
          }
        })
        const started = srt.length > 0 ? Date.now() - srt[srt.length - 1].endTime : 0
        this.props.onSetRecordings({recordings, started})
      } catch (e) {
        window.alert(`Unable to read: ${e}`)
      }
    }
    reader.readAsText(file)
  }

  exportSrt = () => {
    const recordings = this.props.recordings.get('recordings').toJS()
    const srt = recordings.map((rec, id) => {
      id += 1
      return {
        id,
        startTime: rec.timestamp,
        endTime: (recordings[id] || {}).timestamp || rec.timestamp,
        text: JSON.stringify(rec.action)
      }
    })
    const title = nonNull(document.querySelector('title')).textContent
    const now = new Date()
    const name = `${title}_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}:${now.getMinutes()}.srt`
    saveFile(parser.toSrt(srt), name, 'text/plain')
  }

  isRecording () {
    return this.props.recordings.get('state') === STATE_RECORDING
  }

  render () {
    return (
      <div>
        <Player
          onChange={this.updatePlayState}
          onPlayAction={this.props.onPlayAction}
          onToggleState={this.props.onToggleState}
          recordings={this.props.recordings}
          position={this.state.playPosition}
          speed={this.state.playSpeed}
          />
        <Modal
          contentLabel={'Recording'}
          isOpen={this.props.recordings.get('view') !== VIEW_NORMAL}
          onRequestClose={this.props.onToggleView}
          style={modalStyles}
        >
          <div className={styles.container}>
            <div className={styles.top}>
              <h3 className={styles.shortcut}><small><kbd>ctrl + b</kbd></small></h3>
              <h1>Recording</h1>
              {this.renderState()}
            </div>

            {this.renderCurrentRecording()}
            {this.renderPlayer()}
          </div>
        </Modal>

        {this.renderButton()}
      </div>
    )
  }

  renderPlayer () {
    return (
      <PlayerInterface
        onPlayAction={this.props.onPlayAction}
        onToggleState={this.props.onToggleState}
        onChange={this.updatePlayState}
        recordings={this.props.recordings}
        position={this.state.playPosition}
        speed={this.state.playSpeed}
        />
    );
  }

  renderCurrentRecording () {
    const recordings = this.props.recordings.get('recordings').toJS()
    return (
      <pre className={styles.history}>
        {recordings.map(rec => {
          return (
            <span key={rec.timestamp}>
              {rec.timestamp} - {rec.action.type} <br />
                . . . . {JSON.stringify(rec.action.payload)} <br />
            </span>
          )
        })}
      </pre>
    )
  }

  renderState () {
    if (this.isRecording()) {
      return (
        <div>
          <p>State: <strong><Icon icon='videocam' /> recording</strong></p>
          <button
            onClick={this.toggleRecordingState}
          >
            Pause Recording <kbd>[CTRL + .]</kbd>
          </button>
        </div>
      )
    }

    return (
      <div>
        <p>State: not recording</p>
        <div>
          <button
            className={styles.button}
            onClick={this.toggleRecordingState}
          >
            <Icon icon='videocam' /> Start recording <kbd>[CTRL + .]</kbd>
          </button>
          <button
            className={classnames(styles.button, styles.right)}
            onClick={this.props.onReset}
          >
            <Icon icon='clear' /> Reset recording
          </button>
        </div>
        <div className={styles.clear}>
          <button
            className={styles.button}
            onClick={this.exportSrt}
          >
            <Icon icon='download' /> Export SRT
          </button>
          <Dropzone
            onDrop={this.uploadSrt}
            ref={node => { this.dropZone = node }}
            style={dropzoneStyles}
          >
            <button
              className={styles.button}
            >
              <Icon icon='upload' /> Upload SRT
            </button>
          </Dropzone>
        </div>
      </div>
    )
  }

  renderButton () {
    return (
      <div className={classnames(styles.videoIcon, this.isRecording() ? styles.active : null)}>
        <Icon icon='videocam' />
      </div>
    )
  }
}

const dropzoneStyles = {
  width: 'auto',
  height: 'auto',
  float: 'right'
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    zIndex: 2000
  },
  content: {
    position: 'absolute',
    top: '10%',
    left: '17%',
    right: '17%',
    maxHeight: '90%',
    bottom: '15%',
    border: '1px solid #ccc',
    background: '#fff',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '0',
    outline: 'none',
    padding: '2rem'
  }
}
