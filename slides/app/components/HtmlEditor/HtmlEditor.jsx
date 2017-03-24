require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/default.css');

import React from 'react';
import Editor from 'react-medium-editor';

import {Icon} from '../Icon/Icon';

import styles from './HtmlEditor.scss';

// Editor options
const code = {
  name: 'pre',
  action: 'append-pre',
  aria: 'Predefined text',
  tagNames: ['code', 'pre'],
};
const options = {
  toolbar: {
    buttons: [
      'bold', 'italic', 'underline', 'anchor', 'h2', 'h3',
      'image', code,
      'orderedlist', 'unorderedlist',
      'justifyLeft', 'justifyCenter',
      'removeFormat', 'html'
    ]
  }
};

export class HtmlEditor extends React.Component {

  static propTypes = {
    onChange: React.PropTypes.func
  };

  static defaultPropTypes = {
    onChange: null,
  };

  state = {
    text: this.props.text,
    raw: false
  };

  componentWillReceiveProps (nextProps) {
    if (this.props.text !== nextProps.text) {
      this.setState({ text: nextProps.text });
    }
  }

  handleChange = (text) => {
    this.setState({ text });
    if (this.props.onChange) {
      this.props.onChange(text);
    }
  }

  handleRawChange = (ev) => {
    this.handleChange(ev.target.value);
  }

  toggleRaw = () => {
    this.setState({
      raw: !this.state.raw
    });
  }

  render () {
    return (
      <div>
        <a
          className={styles.rawButton}
          onClick={this.toggleRaw}
          title={'Toggle HTML mode'}
          >
          <Icon
            icon='keyboard'
          />
        </a>
        {this.renderEditor()}
      </div>
    );
  }

  renderEditor () {
    if (this.state.raw) {
      return (
        <textarea
          onChange={this.handleRawChange}
          value={this.state.text}
          className={styles.rawEditor}
        />
      );
    }
    return (
      <Editor
        onChange={this.handleChange}
        options={options}
        tag="div"
        text={this.state.text}
      />
    );
  }
}
