import React from 'react'

import Tooltip from '../Tooltip'

import {HtmlResult} from '../HtmlResult/HtmlResult'
import {Icon} from '../Icon/Icon'

import styles from './Preview.scss'

export class Preview extends React.Component {
  renderAlert () {
    const isTakingLong = this.props.isTakingLong
    if (!isTakingLong) {
      return
    }
    return (
      <div className={styles.previewAlert}>
        Your code is running longer than expected. You may be offline or you might try executing again.
      </div>
    )
  }

  renderResultWindow () {
    const runId = this.props.runId
    const runServerUrl = this.props.runServerUrl
    const isLoading = this.props.isLoading
    const isError = this.props.isError
    const file = this.props.file

    if (isError) {
      return (
        <div className={styles.loadingIcon}>
          <Icon icon={'clear'} size={'5em'} />
          <p>
            There was an error running your code. It means that you are offline or server is having some troubles processing your request.
          </p>
        </div>
      )
    }

    if (!runId) {
      return (
        <Tooltip
          overlay={<span>Your preview is being loaded.</span>}
          placement={'top'}
          >
          <div>
            {this.renderAlert()}
            <div className={styles.loadingIcon}>
              <Icon icon={'refresh'} size={'5em'} spin />
            </div>
          </div>
        </Tooltip>
      )
    }

    return (
      <div className={styles.previewWindow}>
        {this.renderAlert()}
        <HtmlResult
          file={file}
          isLoading={isLoading}
          runId={runId}
          runServerUrl={runServerUrl}
        />
      </div>
    )
  }

  getBtnClass () {
    if (this.props.isFresh) {
      return styles.runButton + ' ' + styles.disabled
    }

    return styles.runButton
  }

  renderRunButtonText () {
    if (this.props.isLoading) {
      return (
        <span>
          <Icon icon={'restore'} spin />
          &nbsp;Run Code
        </span>
      )
    }

    if (this.props.isFresh) {
      return (
        <span>
          <Icon icon={'refresh'} />
          &nbsp;Run Code
        </span>
      )
    }

    return (
      <span>
        <Icon icon={'play'} />
        &nbsp;Run Code
      </span>
    )
  }

  triggerRun = () => {
    const forceRun = this.props.isFresh
    this.props.onRun(forceRun)
  };

  renderRunButton () {
    return (
      <button
        className={this.getBtnClass()}
        disabled={this.props.isLoading}
        onClick={this.triggerRun}
        >
        {this.renderRunButtonText()}
      </button>
    )
  }

  renderNewWindowButton () {
    const { isServer, serverUrl, serverPort, runServerUrl } = this.props
    const [proto, host] = runServerUrl.split(':')
    const runServerUrlNoPort = `${host}`
    const link = isServer
      ? `http://${serverUrl || runServerUrlNoPort}:${serverPort}`
      : runServerUrl + '/api/results/' + this.props.runId + '/' + this.props.file

    return (
      <a
        className={styles.newTabButton}
        href={link}
        target={'_blank'}
        >
        <Icon icon={'launch'} />
      </a>
    )
  }

  renderLogsButton () {
    const { isServer, runServerUrl, runId } = this.props
    const link = runServerUrl + '/api/results/' + runId

    return (
      <a
        className={styles.logsButton}
        href={isServer ? link : link + '/_logs.html'}
        target={'_blank'}
        title='Output logs'
        >
        <Icon icon={'subject'} />
      </a>
    )
  }

  render () {
    return (
      <div className={styles.preview}>
        <div className={styles.previewBar}>
          {this.renderRunButton()}
          {this.renderLogsButton()}
          {this.renderNewWindowButton()}
        </div>
        {this.renderResultWindow()}
      </div>
    )
  }
}

Preview.defaultProps = {
  serverUrl: null,
  serverPort: '3000'
}

Preview.propTypes = {
  isLoading: React.PropTypes.bool.isRequired,
  isFresh: React.PropTypes.bool.isRequired,
  isTakingLong: React.PropTypes.bool.isRequired,
  isError: React.PropTypes.bool.isRequired,
  isServer: React.PropTypes.bool.isRequired,
  serverUrl: React.PropTypes.string,
  serverPort: React.PropTypes.string,
  runId: React.PropTypes.string,
  file: React.PropTypes.string.isRequired,
  runServerUrl: React.PropTypes.string.isRequired,
  onRun: React.PropTypes.func.isRequired
}
