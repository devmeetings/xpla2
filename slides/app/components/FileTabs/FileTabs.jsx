import React from 'react';
import Props from 'react-immutable-proptypes';

import styles from './FileTabs.scss';

import Tooltip from '../Tooltip';
import {Icon} from '../Icon/Icon';

export class FileTabs extends React.Component {

  constructor (...args) {
    super(...args);
    this.state = {
      showAll: false
    };
  }

  showAll () {
    this.setState({
      showAll: !this.state.showAll
    });
  }

  clickTab (file, ev) {
    ev.preventDefault();

    this.props.onChange(file);
  }

  getFileName (path) {
    const parts = path.split('/');
    return parts[parts.length - 1];
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

      return this.renderFileLink(file, file.get('name'), true);
    }

    const highlighted = this.props.files.filter((file) => {
      return file.get('highlight').size;
    });

    if (highlighted.size && !this.state.showAll) {
      return this.renderTabs(highlighted).concat([(
        <Tooltip
          overlay={<span>Show other files</span>}
          placement={'bottom'}
          >
          <a
            className={styles.tab}
            key={'more'}
            onClick={this.showAll.bind(this)}
            >
            <Icon icon={'more-horiz'} size={'1em'} />
          </a>
        </Tooltip>
      )]);
    }
    return this.renderTabs(this.props.files);
  }

  renderFileLink (file, fileName, isActive) {
    return (
      <a
        className={isActive ? styles.tabActive : styles.tab}
        key={file.get('name')}
        onClick={!isActive ? this.clickTab.bind(this, file) : null}
        >
        {fileName}
        {this.renderBadge(file)}
      </a>
    );
  }

  renderTabs (files) {
    const activeName = this.props.active.get('name');
    return files.map((file) => {
      const isActive = activeName === file.get('name');
      const path = file.get('name');
      const fileName = this.getFileName(file.get('name'));

      const link = this.renderFileLink(file, fileName, isActive);

      if (path !== fileName) {
        return (
          <Tooltip
            overlay={<span>{path}</span>}
            placement={'bottom'}
            >
            {link}
          </Tooltip>
        );
      }
      return link;
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
