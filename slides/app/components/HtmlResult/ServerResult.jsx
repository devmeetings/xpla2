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
    const { isLoading } = this.props
    const { frameSrc } = this.state

    return (
      <iframe
        className={isLoading ? styles.resultLoading : styles.result}
        seamless
        src={frameSrc}
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
