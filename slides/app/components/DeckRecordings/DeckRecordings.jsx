// @flow

import React from 'react';
import Props from 'react-immutable-proptypes';
import classnames from 'classnames';

import {VIEW_NORMAL, STATE_RECORDING} from '../../reducers.utils/recordings';
import styles from './DeckRecordings.scss';

import Modal from 'react-modal';
import {Icon} from '../Icon/Icon';

export class DeckRecordings extends React.Component {

  static propTypes = {
    onToggleState: React.PropTypes.func.isRequired,
    onToggleView: React.PropTypes.func.isRequired,
    onReset: React.PropTypes.func.isRequired,
    recordings: Props.contains({
      view: React.PropTypes.string.isRequired,
      state: React.PropTypes.string.isRequired
    }).isRequired
  };

  componentDidMount () {
    window.addEventListener('keyup', this.onKey);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.onKey);
  }

  onKey = (ev: KeyboardEvent) => {
    const toggleView = [66/* B */];
    const toggleState = [190/* . */];
    const code = ev.keyCode;
    const ctrl = ev.ctrlKey || ev.metaKey;

    if (ctrl && toggleView.indexOf(code) !== -1) {
      this.props.onToggleView();
      return;
    }

    if (ctrl && toggleState.indexOf(code) !== -1) {
      this.props.onToggleState();
      return;
    }
  };

  isRecording () {
    return this.props.recordings.get('state') === STATE_RECORDING;
  }

  render () {
    return (
      <div>
        <Modal
          contentLabel={'Recording'}
          isOpen={this.props.recordings.get('view') !== VIEW_NORMAL}
          onRequestClose={this.props.onToggleView}
          style={modalStyles}
        >
          <h3 style={{float: 'right'}}><small><kbd>ctrl + b</kbd></small></h3>
          <h1>Recording</h1>
          {this.renderState()}

          {this.renderCurrentRecording()}
          { /* this.renderPlayer() */ }
        </Modal>

        {this.renderButton()}
      </div>
    );
  }

  renderCurrentRecording () {
    return (
      <pre>
        {JSON.stringify(this.props.recordings.get('recordings').toJS(), null, 2)}
      </pre>
    );
  }

  renderState () {
    if (this.isRecording()) {
      return (
        <div>
          <p>State: <strong><Icon icon="videocam" /> recording</strong></p>
          <button
            onClick={this.props.onToggleState}
          >
            Pause Recording <kbd>[CTRL + .]</kbd>
          </button>
        </div>
      );
    }

    return (
      <div>
        <p>State: not recording</p>
        <button
          onClick={this.props.onToggleState}
        >
          <Icon icon="videocam" /> Start recording <kbd>[CTRL + .]</kbd>
        </button>
        <button
          onClick={this.props.onReset}
          style={{float: 'right'}}
        >
          <Icon icon="clear" /> Reset recording
        </button>
      </div>
    );
  }

  renderButton () {
    return (
      <div className={classnames(styles.button, this.isRecording() ? styles.active : null)}>
        <Icon icon="videocam" />
      </div>
    );
  }
}

const modalStyles = {
  overlay : {
    position          : 'fixed',
    top               : 0,
    left              : 0,
    right             : 0,
    bottom            : 0,
    backgroundColor   : 'rgba(0, 0, 0, 0.40)',
    zIndex            : 2000
  },
  content : {
    position                   : 'absolute',
    top                        : '10%',
    left                       : '17%',
    right                      : '17%',
    maxHeight                  : '90%',
    bottom                     : '15%',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '0',
    outline                    : 'none',
    padding                    : '2rem'
  }
};

