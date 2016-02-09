import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import Modal from 'react-modal';
import {Icon} from '../Icon/Icon';
import {AceEditor} from '../AceEditor/AceEditor';
import {getModeForFilename} from '../Editor/Editor';

import styles from './Annotations.scss';

export class Annotations extends React.Component {

  constructor (...args) {
    super(...args);
    this.state = {
      isOpen: this.props.annotations.size > 0,
      currentAnnotation: this.minAnno()
    };
  }

  minAnno() {
    return this.props.hasIntro ? -1 : 0;
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
      top                        : '15%',
      left                       : '20%',
      right                      : '20%',
      height                     : '240px',
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
    if (anno < this.minAnno() || anno > this.props.annotations.size) {
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
        {anno > this.minAnno() ? prevButton : ''}
        {anno < maxAnno ? nextButton : closeButton}
      </div>
    );
  }

  renderAnnotation (anno) {
    const title = this.props.title;

    if (anno === -1 && this.props.hasIntro) {
      return (
        <div className={styles.annotation}>
          <h2 className={styles.slideTitle}>{title}</h2>
          {this.props.children}
        </div>
      );
    }

    const annotation = this.props.annotations.get(anno).toJS();
    const mode = getModeForFilename(annotation.fileName);

    return (
      <div className={styles.annotation}>
        <h2 className={styles.slideTitle}>{title}</h2>
        <h2>
          {annotation.title}
        </h2>
        <pre className={styles.fileName}>
          {annotation.fileName}
        </pre>
        <AceEditor
          height={'100px'}
          highlightActiveLine={false}
          mode={mode}
          name={`editor-annotations-${annotation.line}`}
          readOnly={true}
          showGutter={false}
          showPrintMargin={false}
          theme={'chrome'}
          value={annotation.code}
          width={'100%'}
          />
        <div dangerouslySetInnerHTML={{__html: annotation.description || ''}}></div>
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
  hasIntro: React.PropTypes.bool.isRequired,
  title: React.PropTypes.string.isRequired,
  annotations: Props.listOf(Props.contains({
    order: React.PropTypes.number.isRequired,
    line: React.PropTypes.number.isRequired,
    noOfLines: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired,
    fileName: React.PropTypes.string.isRequired,
    code: React.PropTypes.string.isRequired
  })).isRequired
};

