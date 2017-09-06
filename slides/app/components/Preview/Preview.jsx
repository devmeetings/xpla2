import React from 'react'

import Tooltip from '../Tooltip'

import {HtmlResult} from '../HtmlResult/HtmlResult'
import {ServerResult} from '../HtmlResult/ServerResult'
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
    const { runId, isError } = this.props

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
        {this.renderIframe()}
      </div>
    )
  }

  renderIframe () {
    const { file, isLoading, runId, runServerUrl, isServer, serverPort } = this.props
    const serverUrl = this.serverUrl()

    const htmlResult = (
      <HtmlResult
        file={file}
        isLoading={isLoading}
        runId={runId}
        runServerUrl={runServerUrl}
      />
    )

    if (!isServer) {
      return htmlResult
    }

    return (
      <div className={styles.serverResult}>
        <div className={'xp-row'} style={{ height: '70%' }}>
          <ServerResult
            isLoading={isLoading}
            port={serverPort}
            runServerUrl={runServerUrl}
            url={serverUrl}
          />
        </div>
        <div className={'xp-resize-row'} style={{ borderTop: '1px solid #444' }} />
        <div className={'xp-row'} style={{ height: '30%' }}>
          {htmlResult}
        </div>
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

  serverUrl () {
    const { serverUrl, runServerUrl } = this.props
    const host = runServerUrl.split(':')[1]
    const runServerUrlNoPort = `${host.substr(2)}`

    return serverUrl || runServerUrlNoPort
  }

  renderNewWindowButton () {
    const { isServer, serverPort, runServerUrl } = this.props
    const serverUrl = this.serverUrl()
    const link = isServer
      ? `http://${serverUrl}:${serverPort}`
      : runServerUrl + '/api/results/' + this.props.runId + '/' + this.props.file

    return (
      <a
        className={styles.newTabButton}
        href={link}
        rel={'noopener'}
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
        rel={'noopener'}
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
  serverPort: 3000
}

Preview.propTypes = {
  isLoading: React.PropTypes.bool.isRequired,
  isFresh: React.PropTypes.bool.isRequired,
  isTakingLong: React.PropTypes.bool.isRequired,
  isError: React.PropTypes.bool.isRequired,
  isServer: React.PropTypes.bool.isRequired,
  serverUrl: React.PropTypes.string,
  serverPort: React.PropTypes.number,
  runId: React.PropTypes.string,
  file: React.PropTypes.string.isRequired,
  runServerUrl: React.PropTypes.string.isRequired,
  onRun: React.PropTypes.func.isRequired
}
