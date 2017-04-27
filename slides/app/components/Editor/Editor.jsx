import React from 'react'
import {findDOMNode} from 'react-dom'
import _ from 'lodash'
import Props from 'react-immutable-proptypes'

import {AceEditor, createEditSession as CreateEditSession} from '../AceEditor/AceEditor'
import {FileTabs} from '../FileTabs/FileTabs'
import {FileTree} from '../FileTree/FileTree'
import {ModeMenu} from '../ModeMenu/ModeMenu'
import {isSmallScreen} from '../isSmallScreen'

import {WORK_MODE_DECK_EDIT} from '../../reducers.utils/workMode'

import 'brace/mode/html'
import 'brace/mode/rust'
import 'brace/mode/json'
import 'brace/mode/jsx'
import 'brace/mode/typescript'
import 'brace/mode/java'
import 'brace/mode/golang'
import 'brace/mode/python'
import 'brace/mode/markdown'
import 'brace/mode/sh'
import 'brace/mode/stylus'
import 'brace/mode/yaml'
import 'brace/mode/dart'
import 'brace/mode/elm'
import 'brace/theme/chrome'

import styles from './Editor.scss'

export function getModeForFilename (name) {
  const typeMap = {
    js: 'jsx',
    ts: 'typescript',
    py: 'python',
    go: 'golang',
    md: 'markdown',
    rs: 'rust',
    styl: 'stylus',
    yml: 'yaml'
  }

  const parts = name.split('.')
  const type = _.last(parts)

  return typeMap[type] || type
}

export class Editor extends React.Component {
  constructor (...args) {
    super(...args)
    this.commands = this.getCommands()
    this.state = {}
    this.editorName = Math.random()
  }

  getCommands () {
    return [
      {
        name: 'saveWorkspace',
        bindKey: {
          win: 'Ctrl-Shift-s',
          mac: 'Command-Shift-s',
          sender: 'editor|cli'
        },
        exec: () => {
          this.props.onSaveWorkspaceAsZipAction()
        }
      },
      {
        name: 'saveFile',
        bindKey: {
          win: 'Ctrl-s',
          mac: 'Command-s',
          sender: 'editor|cli'
        },
        exec: () => {
          this.props.onSaveAction()
        }
      }, {
        name: 'runAction',
        bindKey: {
          win: 'Ctrl-Enter',
          mac: 'Command-Enter',
          sender: 'editor|cli'
        },
        exec: () => {
          this.props.onRunAction()
        }
      }, {
        name: 'toggleWorkModeAction',
        bindKey: {
          win: 'Ctrl-p',
          mac: 'Command-p',
          sender: 'editor|cli'
        },
        exec: () => {
          this.props.onWorkModeToggle()
        }
      }
    ]
  }

  _isEditMode () {
    return this.props.workMode === WORK_MODE_DECK_EDIT
  }

  getType (tab) {
    return getModeForFilename(tab.get('name'))
  }

  componentDidMount () {
    this._listener = (ev) => {
      // Don't forward keyups when focused on editor
      ev.stopPropagation()
    }

    findDOMNode(this).addEventListener('keyup', this._listener)
  }

  componentWillUnmount () {
    findDOMNode(this).removeEventListener('keyup', this._listener)
  }

  componentWillMount () {
    this.createActiveEditorSession(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.active === this.props.active) {
      return
    }

    const name = nextProps.active.get('name')
    if (!this.state[name]) {
      this.createActiveEditorSession(nextProps)
    }

    // Update content if changed
    const content = nextProps.active.get('content')
    const editSession = this.state[name]
    if (editSession.getValue() !== content) {
      editSession.setValue(content)
      editSession.cursorPosition = nextProps.active.get('cursorPosition')
    }
  }

  createActiveEditorSession (props) {
    const mode = this.getType(props.active)
    const name = props.active.get('name')
    const content = props.active.get('content')
    const highlight = props.active.get('highlight')

    const editSession = new CreateEditSession(content, mode, highlight.toJS())

    this.setState({
      [name]: editSession
    })
  }

  renderEditor (name, session) {
    const aceEditor = (
      <AceEditor
        commands={this.commands}
        height='100%'
        name={`editor-${name}-${this.editorName}`}
        onChange={this.props.onTabContentChange}
        session={session}
        cursorPosition={session.cursorPosition}
        theme='chrome'
        width='100%'
        />
    )

    const isFileTree = this.props.showFileTree && !isSmallScreen()
    if (!isFileTree) {
      return (
        <div>
          <ModeMenu
            isEditMode={this._isEditMode()}
            />
          <FileTabs
            active={this.props.active}
            files={this.props.files}
            onChange={this.props.onTabChange}
            />
          <div className={styles.aceEditor}>
            {aceEditor}
          </div>
        </div>
      )
    }
    return (
      <div className={styles.treeEditor}>
        <div className={'xp-column'} style={{width: '11rem'}}>
          <FileTree
            active={this.props.active}
            files={this.props.files}
            onChange={this.props.onTabChange}
            />
        </div>
        <div className={'xp-resize-column'} />
        <div className={'xp-column'} style={{width: 'calc(100% - 11rem)'}}>
          <div className={styles.treeEditorAce}>
            {aceEditor}
          </div>
        </div>
      </div>
    )
  }

  render () {
    if (!this.props.active) {
      return
    }

    const name = this.props.active.get('name')
    const session = this.state[name]

    return (
      <div
        className={this._isEditMode() ? styles.editorEdit : styles.editor}
        >
        {this.renderEditor(name, session)}
      </div>
    )
  }
}
Editor.propTypes = {
  files: Props.listOf(Props.contains({
    name: React.PropTypes.string.isRequired,
    content: React.PropTypes.string.isRequired
  })),
  active: Props.contains({
    name: React.PropTypes.string.isRequired,
    content: React.PropTypes.string.isRequired
  }),
  showFileTree: React.PropTypes.bool.isRequired,
  workMode: React.PropTypes.string,
  onWorkModeToggle: React.PropTypes.func.isRequired,
  onSaveAction: React.PropTypes.func.isRequired,
  onRunAction: React.PropTypes.func.isRequired,
  onTabChange: React.PropTypes.func.isRequired,
  onTabContentChange: React.PropTypes.func.isRequired,
  onSaveWorkspaceAsZipAction: React.PropTypes.func.isRequired
}
