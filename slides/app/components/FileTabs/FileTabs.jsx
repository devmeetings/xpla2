import React from 'react';
import Props from 'react-immutable-proptypes';

import styles from './FileTabs.scss';

export class FileTabs extends React.Component {

  clickTab (file, ev) {
    ev.preventDefault();

    this.props.onChange(file);
  }

  renderTabLinks () {
    if (this.props.files.size < 2) {
      return;
    }

    const activeName = this.props.active.get('name');
    return this.props.files.map((file) => {
      const isActive = activeName === file.get('name');
      return (
        <a
          className={isActive ? styles.tabActive : styles.tab}
          key={file.get('name')}
          onClick={this.clickTab.bind(this, file)}>{file.get('name')}</a>
      );
    });
  }

  render () {
    return (
      <div
        className={styles.tabs}
        >
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
  active: Props.contains({
    name: React.PropTypes.string.isRequired
  }).isRequired,
  onChange: React.PropTypes.func
};
