import React from 'react';
import Props from 'react-immutable-proptypes';

export class FileTabs extends React.Component {

  clickTab (file, ev) {
    ev.preventDefault();

    this.props.onChange(file);
  }

  renderTabLinks () {
    if (this.props.files.size < 2) {
      return;
    }

    return this.props.files.map((file) => {
      return (
        <a
          href
          key={file.get('name')}
          onClick={this.clickTab.bind(this, file)}>{file.get('name')}</a>
      );
    });
  }

  render () {
    return (
      <div>
        {this.renderTabLinks()}
      </div>
    );
  }
}

FileTabs.propTypes = {
  files: Props.listOf(Props.contains({
    name: React.PropTypes.string.isRequired,
    content: React.PropTypes.string.isRequired
  })),
  onChange: React.PropTypes.func
};
