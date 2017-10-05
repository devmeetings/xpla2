import React from 'react'

import styles from './HtmlResult.scss'

export class ServerResult extends React.Component {

  state = {
    url: ''
  }

  componentWillMount () {
    this.updateUrl(this.props)
  }

  componentWillReceiveProps (newProps) {
    this.updateUrl(newProps)
  }

  updateUrl (props) {
    const { runServerUrl, port, url } = props
    const frameSrc = `${runServerUrl}/proxy/${url}/${port}/`

    if (this.state.frameSrc !== frameSrc) {
      // Wait for the server to initialize.
      setTimeout(() => {
        this.setState({ frameSrc })
      }, 1000)
    }
  }

  render () {
    const { runServerUrl, isLoading, port, url } = this.props

    return (
      <iframe
        className={isLoading ? styles.resultLoading : styles.result}
        seamless
        src={this.state.frameSrc}
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
