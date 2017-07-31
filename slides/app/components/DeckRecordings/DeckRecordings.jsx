// @flow

import React from 'react'
import Props from 'react-immutable-proptypes'
import classnames from 'classnames'
import parser from 'subtitles-parser'
import Dropzone from 'react-dropzone'

import {VIEW_NORMAL, STATE_RECORDING} from '../../reducers.utils/recordings'
import styles from './DeckRecordings.scss'

import Modal from 'react-modal'
import {Icon} from '../Icon/Icon'
import {Player, PlayerInterface} from './Player'
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
    const srt = files.find(file => file.name.endsWith('.srt'))
    const json = files.find(file => file.name.endsWith('.json'))
    if (!srt || !json) {
      window.alert('You need to upload both SRT and JSON files.')
      console.error(files)
      return
    }

    const recordings = new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const srt = parser.fromSrt(e.target.result, true)
          const recordings = srt.map(rec => {
            return {
              timestamp: rec.startTime,
              action: parseInt(rec.text, 10)
            }
          })
          const started = srt.length > 0 ? Date.now() - srt[srt.length - 1].endTime : 0

          resolve([recordings, started])
        } catch (e) {
          window.alert(`Unable to read: ${e}`)
          reject(e)
        }
      }
      reader.readAsText(srt)
    })

    const data = new Promise((resolve, reject) => {
      const reader2 = new FileReader()
      reader2.onload = (e) => {
        try {
          resolve(JSON.parse(e.target.result))
        } catch (e) {
          window.alert(`Unable to parse JSON: ${e}`)
          reject(e)
        }
      }
      reader2.readAsText(json)
    })

    Promise.all([recordings, data])
      .then(([rec, json]) => {
        let [recordings, started] = rec

        recordings = recordings.map(rec => {
          rec.action = json[rec.action - 1]
          return rec
        })

        this.props.onSetRecordings({recordings, started})
      })
      .catch(e => {
        window.alert('Error: ' + e)
        console.error(e)
      })
  }

  exportSrt = () => {
    const recordings = this.props.recordings.get('recordings').toJS()
    const srt = recordings.map((rec, id) => {
      id += 1
      return {
        id,
        startTime: rec.timestamp,
        endTime: (recordings[id] || {}).timestamp - 1 || rec.timestamp + 1000,
        text: `${id}`
      }
    })
    const complete = JSON.stringify(recordings.map((rec) => rec.action))
    const title = nonNull(document.querySelector('title')).textContent
    const now = new Date()
    const name = `${title}_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}:${now.getMinutes()}`
    saveFile(parser.toSrt(srt), `${name}.srt`, 'text/plain')
    saveFile(complete, `${name}.json`, 'application/json')
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
          position={this.state.playPosition}
          recordings={this.props.recordings}
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
        onChange={this.updatePlayState}
        onPlayAction={this.props.onPlayAction}
        onToggleState={this.props.onToggleState}
        position={this.state.playPosition}
        recordings={this.props.recordings}
        speed={this.state.playSpeed}
        />
    )
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
