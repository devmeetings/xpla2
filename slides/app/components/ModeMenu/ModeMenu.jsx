import React from 'react';
import Props from 'react-immutable-proptypes';

import styles from './ModeMenu.scss';
import pencil from './pencil2.svg';

export class ModeMenu extends React.Component {

  renderIcon () {
    if (!this.props.isEditMode) {
      return;
    }
    return (
      <img
        title={'You are now in edit mode. Use CTRL+S to save new slide.'}
        className={styles.icon}
        src={pencil}
        />
    );
  }

  render () {
    return (
      <div
        className={styles.mode}
        >
        {this.renderIcon()}
      </div>
    );
  }
}

ModeMenu.propTypes = {
  isEditMode: React.PropTypes.bool.isRequired
};
