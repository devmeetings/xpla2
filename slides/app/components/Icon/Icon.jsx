// @flow

import React from 'react'

import cssStyles from './Icon.scss'

export class Icon extends React.Component {
  static defaultProps = {
    size: '1em',
    spin: false,
    style: {}
  };

  static propTypes = {
    size: React.PropTypes.string,
    spin: React.PropTypes.bool,
    icon: React.PropTypes.string.isRequired,
    style: React.PropTypes.object
  };

  _mergeStyles (...args: any) {
    // This is the m function from "CSS in JS" and can be extracted to a mixin
    return Object.assign({}, ...args)
  }

  renderGraphic () {
    return ICONS[this.props.icon]
  }

  render () {
    const isSpinning = this.props.spin
    const styles = {
      fill: 'currentcolor',
      verticalAlign: 'middle',
      width: this.props.size,
      height: this.props.size
    }
    return (
      <svg
        className={isSpinning ? cssStyles.spinning : cssStyles.normal}
        preserveAspectRatio='xMidYMid meet'
        style={this._mergeStyles(
          styles,
          this.props.style
        )}
        viewBox='0 0 24 24'
        >
        {this.renderGraphic()}
      </svg>
    )
  }
}

// http://dmfrancisco.github.io/react-icons/
const ICONS = {
  'upload': (
    <g><path d='M19.35 10.04c-.68-3.45-3.71-6.04-7.35-6.04-2.89 0-5.4 1.64-6.65 4.04-3.01.32-5.35 2.87-5.35 5.96 0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zm-5.35 2.96v4h-4v-4h-3l5-5 5 5h-3z' /></g>
  ),
  'download': (
    <g><path d='M19 9h-4v-6h-6v6h-4l7 7 7-7zm-14 9v2h14v-2h-14z' /></g>
  ),
  'videocam': (
    <g><path d='M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z' /></g>
  ),
  'keyboard': (
    <g><path d='M20 5h-16c-1.1 0-1.99.9-1.99 2l-.01 10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-10c0-1.1-.9-2-2-2zm-9 3h2v2h-2v-2zm0 3h2v2h-2v-2zm-3-3h2v2h-2v-2zm0 3h2v2h-2v-2zm-1 2h-2v-2h2v2zm0-3h-2v-2h2v2zm9 7h-8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2v-2h2v2zm3 3h-2v-2h2v2zm0-3h-2v-2h2v2z' /></g>
  ),
  'receipt': (
    <g><path d='M18 17h-12v-2h12v2zm0-4h-12v-2h12v2zm0-4h-12v-2h12v2zm-15 13l1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5v-20l-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5v20z' /></g>
  ),
  'refresh': (
    <g><path d='M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46c1.23.78 2.69 1.24 4.26 1.24 4.42 0 8-3.58 8-8h3l-4-4zm-13 4c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46c-1.23-.78-2.69-1.24-4.26-1.24-4.42 0-8 3.58-8 8h-3l4 4 4-4h-3z' /></g>
  ),
  'check': (<g><path d='M9 16.17l-4.17-4.17-1.42 1.41 5.59 5.59 12-12-1.41-1.41z' /></g>),
  'clear': (<g><path d='M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z' /></g>),
  'launch': (
    <g><path d='M19 19h-14v-14h7v-2h-7c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zm-5-16v2h3.59l-9.83 9.83 1.41 1.41 9.83-9.83v3.59h2v-7h-7z' /></g>
  ),
  'play': (
    <g><path d='M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' /></g>
  ),

  'mode-edit': (
    <g><path d='M3 17.25v3.75h3.75l11.06-11.06-3.75-3.75-11.06 11.06zm17.71-10.21c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' /></g>
  ),
  'visibility': (
    <g><path d='M12 4.5c-5 0-9.27 3.11-11 7.5 1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' /></g>
  ),
  'restore': (
    <g><path d='M13 3c-4.97 0-9 4.03-9 9h-3l3.89 3.89.07.14 4.04-4.03h-3c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42c1.63 1.63 3.87 2.64 6.36 2.64 4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08v-4.25h-1.5z' /></g>
  ),
  'more-horiz': (
    <g><path d='M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' /></g>
  ),
  'dot': (
    <g><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' /></g>
  ),
  'chevron-left': (
    <g><path d='M15.41 7.41l-1.41-1.41-6 6 6 6 1.41-1.41-4.58-4.59z' /></g>
  ),
  'chevron-right': (
    <g><path d='M10 6l-1.41 1.41 4.58 4.59-4.58 4.59 1.41 1.41 6-6z' /></g>
  ),
  'pause': (
    <g><path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' /></g>
  ),
  'play-arrow': (
    <g><path d='M8 5v14l11-7z' /></g>
  ),
  'stop': (
    <g><path d='M6 6h12v12H6z' /></g>
  ),
  'keyboard-return': (
    <g><path d='M19 7v4h-13.17l3.58-3.59-1.41-1.41-6 6 6 6 1.41-1.41-3.58-3.59h15.17v-6z' /></g>
  ),
  'subject': (
    <g><path d='M14 17h-10v2h10v-2zm6-8h-16v2h16v-2zm-16 6h16v-2h-16v2zm0-10v2h16v-2h-16z' /></g>
  )
}
