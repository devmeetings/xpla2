require('medium-editor/dist/css/medium-editor.css');
require('medium-editor/dist/css/themes/default.css');

import React from 'react';
import Editor from 'react-medium-editor';

// Editor options
const options = {
};

export class HtmlEditor extends React.Component {

  static propTypes = {
    onChange: React.PropTypes.func
  };

  static defaultPropTypes = {
    onChange: null,
  };

  state = {
    text: this.props.text
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

  render () {
    return (
      <Editor
        tag='div'
        text={this.state.text}
        onChange={this.handleChange}
        options={options}
        />
    );
  }
}
