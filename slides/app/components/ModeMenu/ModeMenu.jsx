import React from 'react';
import Props from 'react-immutable-proptypes';

import Tooltip from '../Tooltip';

import {Icon} from '../Icon/Icon';

import styles from './ModeMenu.scss';

export class ModeMenu extends React.Component {

  renderTooltip () {
    if (this.props.isEditMode) {
      return (
        <span>You are now in edit mode. Use CTRL+S to save new slide.</span>
      );
    }
    return (
      <span>Press CTRL+P While focusing editor to switch to edit mode.</span>
    );
  }

  render () {
    return (
      <div className={this.props.isEditMode ? styles.mode : styles.modeLight}>
        <Tooltip
          placement={'left'}
          overlay={this.renderTooltip()}
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
