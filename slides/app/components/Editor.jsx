import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import {AceEditor} from './AceEditor';
import {FileTabs} from './FileTabs';

import 'brace/mode/html';
import 'brace/mode/javascript';
import 'brace/theme/github';

export class Editor extends React.Component {

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
    return (
      <div>
        <FileTabs
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
  onTabChange: React.PropTypes.func.isRequired,
  onTabContentChange: React.PropTypes.func.isRequired
};
