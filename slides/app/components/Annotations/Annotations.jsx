import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import Modal from 'react-modal';

import styles from './Annotations.scss';

export class Annotations extends React.Component {
  
  constructor (...args) {
    super(...args);
    this.state = {
      isOpen: true
    };
  }

  closeModal () {
    this.setState({
      isOpen: false
    });
  }

  modalStyles = {
    overlay : {
      position          : 'fixed',
      top               : 0,
      left              : 0,
      right             : 0,
      bottom            : 0,
      backgroundColor   : 'rgba(0, 0, 0, 0.50)'
    },
    content : {
      position                   : 'absolute',
      top                        : '5%',
      left                       : '10%',
      right                      : '10%',
      bottom                     : '5%',
      border                     : '1px solid #ccc',
      background                 : '#fff',
      overflow                   : 'auto',
      WebkitOverflowScrolling    : 'touch',
      borderRadius               : '0',
      outline                    : 'none',
      padding                    : '2rem'
    }
  },

  render () {
    return (
      <Modal
        isOpen={this.state.isOpen}
        onRequestClose={this.closeModal.bind(this)}
        styles={this.modalStyles}
        >
        <h2>Hello From modal</h2>
      </Modal>
    );
  }
}

Annotations.propTypes = {
};

