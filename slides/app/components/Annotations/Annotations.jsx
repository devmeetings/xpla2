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
  }

  modalStyles = {
    overlay : {
      position          : 'fixed',
      top               : 0,
      left              : 0,
      right             : 0,
      bottom            : 0,
      backgroundColor   : 'rgba(0, 0, 0, 0.40)',
      zIndex            : 1000
    },
    content : {
      position                   : 'absolute',
      top                        : '10%',
      left                       : '22%',
      right                      : '22%',
      minHeight                  : '300px',
      maxHeight                  : '90%',
      bottom                     : '15%',
      border                     : '1px solid #ccc',
      background                 : '#fff',
      overflow                   : 'auto',
      WebkitOverflowScrolling    : 'touch',
      borderRadius               : '0',
      outline                    : 'none',
      padding                    : '2rem'
    }
  };

  renderButtons (anno) {
    const prevButton = (
      <button
        className={styles.button}
        onClick={this.props.onPrev}
        >
        <Icon icon={'chevron-left'} />
      </button>
    );
    const nextButton = (
      <button
        className={styles.button}
        onClick={this.props.onNext}
        >
        <Icon icon={'chevron-right'} /> Next
      </button>
    );
    const closeButton = (
       <button
        className={styles.button}
        onClick={this.props.onRequestClose}
        >
        <Icon icon={'chevron-right'} /> Ok. I get it
      </button>
    );
    const maxAnno = this.props.annotations.size - 1;

    return (
      <div className={styles.buttonBar}>
        {anno > this.props.minAnno ? prevButton : ''}
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

    if (this.props.annotations.size <= anno) {
      return (<div></div>);
    }

    const annotation = this.props.annotations.get(anno).toJS();
    const mode = getModeForFilename(annotation.fileName);

    return (
      <div className={styles.annotation}>
        <h2 className={styles.slideTitle}>{title}</h2>
        <pre className={styles.fileName}>
          {annotation.fileName}
        </pre>
        <div className={styles.editor}>
          <AceEditor
            height={'100%'}
            highlight={annotation.highlight}
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
        </div>
        <div
          className={annotation.description ? styles.slideDescription: ''}
          dangerouslySetInnerHTML={{__html: annotation.description || ''}}></div>
    </div>
    );
  }

  renderClose () {
    return (
      <a
        className={styles.close}
        onClick={this.props.onRequestClose}>
        <Icon icon="clear" />
      </a>
    );
  }

  render () {
    if (this.props.annotations.size == 0) {
      return (<div></div>);
    }

    const anno = this.props.currentAnnotation;
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
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
  })).isRequired,
  minAnno: React.PropTypes.number.isRequired,
  onRequestClose: React.PropTypes.func.isRequired,
  onNext: React.PropTypes.func.isRequired,
  onPrev: React.PropTypes.func.isRequired,
};

