import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import {AceEditor} from '../AceEditor/AceEditor';
import {FileTabs} from '../FileTabs/FileTabs';

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
          this.props.onSaveAction();
        }
      }
    ];
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

  render () {
    if (!this.props.active) {
      return;
    }

    return (
      <div
        className={styles.editor}
        >
        <FileTabs
          active={this.props.active}
          files={this.props.files}
          onChange={this.props.onTabChange}
          />
        <AceEditor
          mode={this.getType(this.props.active)}
          theme='github'
          onChange={this.props.onTabContentChange}
          name={`editor-${this.props.active.get('name')}`}
          editorProps={{$blockScrolling: true}}
          value={this.props.active.get('content')}
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
  onSaveAction: React.PropTypes.func.isRequired,
  onTabChange: React.PropTypes.func.isRequired,
  onTabContentChange: React.PropTypes.func.isRequired
};
