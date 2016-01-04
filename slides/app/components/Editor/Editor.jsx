import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import {EditSession} from 'brace';

import {AceEditor} from '../AceEditor/AceEditor';
import {FileTabs} from '../FileTabs/FileTabs';
import {ModeMenu} from '../ModeMenu/ModeMenu';

import {WORK_MODE_DECK_EDIT} from '../../reducers.utils/workMode';

import 'brace/mode/html';
import 'brace/mode/javascript';
import 'brace/mode/java';
import 'brace/mode/python';
import 'brace/theme/github';

import styles from './Editor.scss';

export class Editor extends React.Component {

  constructor (...args) {
    super(...args);
    this.commands = this.getCommands();
    this.state = {};
  }

  getCommands () {
    return [
      {
        name: 'saveFile',
        bindKey: {
          win: 'Ctrl-s',
          mac: 'Command-s',
          sender: 'editor|cli'
        },
        exec: () => {
          this.props.onSaveAction();
        }
      }, {
        name: 'runAction',
        bindKey: {
          win: 'Ctrl-Enter',
          mac: 'Command-Enter',
          sender: 'editor|cli'
        },
        exec: () => {
          this.props.onRunAction();
        }
      }, {
        name: 'toggleWorkModeAction',
        bindKey: {
          win: 'Ctrl-p',
          mac: 'Command-p',
          sender: 'editor|cli'
        },
        exec: () => {
          this.props.onWorkModeToggle();
        }
      }
    ];
  }

  _isEditMode () {
    return this.props.workMode === WORK_MODE_DECK_EDIT;
  }

  getType (tab) {
    const typeMap = {
      js: 'javascript'
    };

    const name = tab.get('name');
    const parts = name.split('.');
    const type = _.last(parts);

    return typeMap[type] || type;
  }

  componentWillMount () {
    this.createActiveEditorSession(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.active === this.props.active) {
      return;
    }

    const name = nextProps.active.get('name');
    if (!this.state[name]) {
      this.createActiveEditorSession(nextProps);
    }
  }

  createActiveEditorSession (props) {
    const mode = this.getType(props.active);
    const name = props.active.get('name');
    const content = props.active.get('content');

    this.setState({
      [name]: new EditSession(content, `ace/mode/${mode}`)
    });
  }

  render () {
    if (!this.props.active) {
      return;
    }

    const name = this.props.active.get('name');
    const session = this.state[name];
    return (
      <div
        className={this._isEditMode() ? styles.editorEdit : styles.editor}
        >
        <ModeMenu
          isEditMode={this._isEditMode()}
          />
        <FileTabs
          active={this.props.active}
          files={this.props.files}
          onChange={this.props.onTabChange}
          />
        <AceEditor
          theme='github'
          onChange={this.props.onTabContentChange}
          name={`editor-${name}`}
          session={session}
          commands={this.commands}
          width='100%'
          height='calc(100% - 30px)'
        />
      </div>
    );
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
  workMode: React.PropTypes.string,
  onWorkModeToggle: React.PropTypes.func.isRequired,
  onSaveAction: React.PropTypes.func.isRequired,
  onRunAction: React.PropTypes.func.isRequired,
  onTabChange: React.PropTypes.func.isRequired,
  onTabContentChange: React.PropTypes.func.isRequired
};
