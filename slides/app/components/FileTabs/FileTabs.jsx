import React from 'react';
import Props from 'react-immutable-proptypes';

import styles from './FileTabs.scss';

import {Icon} from '../Icon/Icon';

export class FileTabs extends React.Component {

  clickTab (file, ev) {
    ev.preventDefault();

    this.props.onChange(file);
  }

  renderBadge (file) {
    if (!file.get('highlight').size) {
      return;
    }
    return (
      <span className={styles.badge}>
        <Icon icon={'dot'} size={'1em'} />
      </span>
    );
  }

  renderTabLinks () {
    if (this.props.files.size < 2) {
      const file = this.props.files.get(0);
      return (
        <a
          className={styles.tabActive}
          >
          {file.get('name')}
        </a>
      );
    }

    const activeName = this.props.active.get('name');
    return this.props.files.map((file) => {
      const isActive = activeName === file.get('name');
      return (
        <a
          className={isActive ? styles.tabActive : styles.tab}
          key={file.get('name')}
          onClick={this.clickTab.bind(this, file)}
          >
          {file.get('name')}
          {this.renderBadge(file)}
        </a>
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
