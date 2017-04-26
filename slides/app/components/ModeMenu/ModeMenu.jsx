import React from 'react';
import Props from 'react-immutable-proptypes';

import Tooltip from '../Tooltip';

import {Icon} from '../Icon/Icon';

import styles from './ModeMenu.scss';

export class ModeMenu extends React.Component {
  renderTooltip () {
    if (this.props.isEditMode) {
      return (
        <span>
          You are now in edit mode. Use <kbd>CTRL+S</kbd> to save new slide. <br />
          Press <kbd>CTRL+P</kbd> again to go back to view mode.
        </span>
      );
    }
    return (
      <span>
        Press <kbd>CTRL+P</kbd> While focusing editor to switch to edit mode.<br />
        Use <kbd>CTRL+S</kbd> or CTRL+Enter to execute your code. <br />
        Press <kbd>CTRL+Shift+S</kbd> to save your workspace to local disk.
      </span>
    );
  }

  render () {
    return (
      <div className={this.props.isEditMode ? styles.mode : styles.modeLight}>
        <Tooltip
          overlay={this.renderTooltip()}
          placement={'bottom'}
          >
          <div>
            <Icon icon={this.props.isEditMode ? 'mode-edit' : 'visibility'} />
          </div>
        </Tooltip>
      </div>
    );
  }
}

ModeMenu.propTypes = {
  isEditMode: React.PropTypes.bool.isRequired
};
