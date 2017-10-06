import React from 'react'

import styles from './HtmlResult.scss'

export class ServerResult extends React.Component {
  state = {
    frameSrc: ''
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

    const idx = this.state.frameSrc.indexOf('?t=')
    const currentSrc = idx > -1 ? this.state.frameSrc.substr(0, idx) : this.state.frameSrc
    if (currentSrc !== frameSrc) {
      // Wait for the server to initialize.
      setTimeout(() => {
        this.setState({
          // bust cache
          frameSrc: `${frameSrc}?t=${Date.now()}`
        })
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
