import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import {Icon} from '../components/Icon/Icon';

// TODO [todr] Most of the logic should go to Timer component instead!
import styles from './TimerWrapper.scss';

export class TimerContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.timer = null;
    this.state = {
      time: this.props.timer.get('time'),
      isPaused: true,
      currentTime: 0,
      deadline: 0
    };
  }

  updateState () {
    this.setState({
      currentTime: this.now()
    });
  }

  componentDidMount () {
    this.timer = setInterval(() => this.updateState());
  }

  componentWillUnmount () {
    clearInterval(this.timer);
  }

  now () {
    return new Date().getTime();
  }

  resume () {
    this.setState({
      isPaused: false,
      deadline: this.now() + this.state.time * 1000 * 60
    });
  }

  pause () {
    this.setState({
      isPaused: true
    });
  }

  handleInput (ev) {
    const val = parseInt(ev.target.innerHTML, 10);
    if (isNaN(val)) {
      return;
    }
    this.setState({
      time: val
    });
  }

  render () {
    const isPaused = this.state.isPaused;
    if (isPaused) {
      return (
        <div>
          <h1>
            <span
              contentEditable={true}
              dangerouslySetInnerHTML={{__html: this.state.time}}
              onInput={this.handleInput.bind(this)}>
            </span>
            &nbsp;min
          </h1>
          <button onClick={this.resume.bind(this)} className={styles.button}>
            <Icon icon={'play-arrow'} />
          </button>
        </div>
      );
    }

    const timeLeft = ((this.state.deadline - this.state.currentTime) / 1000 / 60).toFixed(1);
    return (
      <div>
          <h1>{timeLeft} min</h1>
          <button onClick={this.pause.bind(this)} className={styles.button}>
            <Icon icon={'stop'} />
          </button>
      </div>
    );
  }

}

TimerContainer.propTypes = {
  timer: Props.map.isRequired,
  globalEvents: React.PropTypes.object.isRequired
};

@connect(
  state => ({
    timer: state.get('timer'),
  }),
  dispatch => ({
  })
)
export default class TimerContainerWrapper extends React.Component {
  render() {
    return (
      <TimerContainer {...this.props} />
    )
  }
}
TimerContainerWrapper.propTypes = {
  globalEvents: React.PropTypes.object.isRequired
};
