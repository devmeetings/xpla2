import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import Modal from 'react-modal';
import {Icon} from '../Icon/Icon';

import styles from './Annotations.scss';

export class Annotations extends React.Component {

  constructor (...args) {
    super(...args);
    this.state = {
      isOpen: this.props.annotations.size > 0,
      currentAnnotation: 0
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
      backgroundColor   : 'rgba(0, 0, 0, 0.50)',
      zIndex            : 1000
    },
    content : {
      position                   : 'absolute',
      top                        : '10%',
      left                       : '20%',
      right                      : '20%',
      height                     : '30%',
      bottom                     : 'auto',
      border                     : '1px solid #ccc',
      background                 : '#fff',
      overflow                   : 'auto',
      WebkitOverflowScrolling    : 'touch',
      borderRadius               : '0',
      outline                    : 'none',
      padding                    : '2rem'
    }
  };

  changeAnnotation (anno) {
    if (anno < 0 || anno > this.props.annotations.size) {
      return;
    }

    this.setState({
      currentAnnotation: anno
    });
  }

  renderButtons (anno) {
    const prevButton = (
      <button
        className={styles.button}
        onClick={this.changeAnnotation.bind(this, anno - 1)}
        >
        <Icon icon={'chevron-left'} />
      </button>
    );
    const nextButton = (
      <button
        className={styles.button}
        onClick={this.changeAnnotation.bind(this, anno + 1)}
        >
        <Icon icon={'chevron-right'} /> Next
      </button>
    );
    const closeButton = (
       <button
        className={styles.button}
        onClick={this.closeModal.bind(this)}
        >
        <Icon icon={'chevron-right'} /> Ok. I get it
      </button>
    );
    const maxAnno = this.props.annotations.size - 1;

    return (
      <div className={styles.buttonBar}>
        {anno > 0 ? prevButton : ''}
        {anno < maxAnno ? nextButton : closeButton}
      </div>
    );
  }

  renderAnnotation (anno) {
    const annotation = this.props.annotations.get(anno).toJS();
    return (
      <div className={styles.annotation}>
        <h1>{annotation.title}</h1>
        <pre><code>{annotation.code}</code></pre>
      </div>
    );
  }

  renderClose () {
    return (
      <a
        className={styles.close}
        onClick={this.closeModal.bind(this)}>
        <Icon icon="clear" />
      </a>
    );
  }

  render () {
    if (this.props.annotations.size == 0) {
      return (<div></div>);
    }

    const anno = this.state.currentAnnotation;
    return (
      <Modal
        isOpen={this.state.isOpen}
        onRequestClose={this.closeModal.bind(this)}
        style={this.modalStyles}
        >
        {this.renderClose()}
        {this.renderAnnotation(anno)}
        {this.renderButtons(anno)}
      </Modal>
    );
  }
}

Annotations.propTypes = {
  annotations: Props.listOf(Props.contains({
    order: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired,
    code: React.PropTypes.string.isRequired
  })).isRequired
};

