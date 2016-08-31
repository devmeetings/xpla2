import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import {TimerContainer} from './TimerWrapper';

// TODO [ToDr] much of the logic should be moved to Tasks component!
import styles from './TasksWrapper.scss'

export class TasksContainer extends React.Component {

  constructor(...args) {
    super(...args);
  }

  renderTasks () {
    return this.props.tasks.map((task, idx) => {
      return (
        <li key={idx} className={styles.task}>
          <span dangerouslySetInnerHTML={{__html: task.get('content')}}></span>
          <span className={`${styles.badge} ${styles[task.get('type')]}`}>{task.get('type')}</span>
        </li>
      );
    }).toJS();
  }

  render () {
    return (
      <div>
        <div dangerouslySetInnerHTML={{__html: this.props.header}}></div>
        <TimerContainer timer={this.props.timer} globalEvents={this.props.globalEvents} />
        <ol>
          {this.renderTasks()}
        </ol>
      </div>
    );
  }

}

TasksContainer.propTypes = {
  timer: Props.map.isRequired,
  tasks: Props.list.isRequired,
  header: React.PropTypes.string.isRequired,
  globalEvents: React.PropTypes.object.isRequired
};

@connect(
  state => ({
    timer: state.get('tasks'),
    header: state.get('tasks').get('header'),
    tasks: state.get('tasks').get('tasks'),
  }),
  dispatch => ({
  })
)
export default class TasksContainerWrapper extends React.Component {
  render() {
    return (
      <TasksContainer {...this.props} />
    )
  }
}
TasksContainerWrapper.propTypes = {
  globalEvents: React.PropTypes.object.isRequired
};
