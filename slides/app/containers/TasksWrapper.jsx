import React from 'react'
import {connect} from 'react-redux'
import Props from 'react-immutable-proptypes'

import {TimerContainer} from './TimerWrapper'

// TODO [ToDr] much of the logic should be moved to Tasks component!
import styles from './TasksWrapper.scss'

export class TasksContainer extends React.Component {
  renderTasks () {
    return this.props.tasks.map((task, idx) => {
      return (
        <li className={styles.task} key={idx}>
          <div dangerouslySetInnerHTML={{__html: task.get('content')}} />
          <div className={`${styles.badge} ${styles[task.get('type')]}`}>{task.get('type')}</div>
        </li>
      )
    }).toJS()
  }

  render () {
    return (
      <div>
        <div dangerouslySetInnerHTML={{__html: this.props.header}} />
        <TimerContainer
          globalEvents={this.props.globalEvents}
          timer={this.props.timer}
          />
        <ol>
          {this.renderTasks()}
        </ol>
        <div dangerouslySetInnerHTML={{__html: this.props.footer}} />
      </div>
    )
  }
}

TasksContainer.propTypes = {
  timer: Props.map.isRequired,
  tasks: Props.list.isRequired,
  header: React.PropTypes.string.isRequired,
  footer: React.PropTypes.string,
  globalEvents: React.PropTypes.object.isRequired
}

@connect(
  state => ({
    timer: state.get('tasks'),
    header: state.get('tasks').get('header'),
    footer: state.get('tasks').get('footer'),
    tasks: state.get('tasks').get('tasks')
  }),
  dispatch => ({
  })
)
export default class TasksContainerWrapper extends React.Component {
  render () {
    return (
      <TasksContainer {...this.props} />
    )
  }
}
TasksContainerWrapper.propTypes = {
  globalEvents: React.PropTypes.object.isRequired
}
