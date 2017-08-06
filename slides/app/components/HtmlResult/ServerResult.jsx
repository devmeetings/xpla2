import React from 'react'

import styles from './HtmlResult.scss'

export class ServerResult extends React.Component {
  render () {
    const { runServerUrl, isLoading, port, url } = this.props

    return (
      <iframe
        className={isLoading ? styles.resultLoading : styles.result}
        seamless
        src={`${runServerUrl}/proxy/${url}/${port}/`}
        />
    )
  }
}

ServerResult.propTypes = {
  isLoading: React.PropTypes.bool.isRequired,
  port: React.PropTypes.number.isRequired,
  url: React.PropTypes.string.isRequired,
  runServerUrl: React.PropTypes.string.isRequired
}
