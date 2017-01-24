import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

// TODO [todr] This is very temporary!
import {fromJS} from 'immutable';

import Modal from 'react-modal';
import {Icon} from '../Icon/Icon';
import {AceEditor} from '../AceEditor/AceEditor';
import {FileTree} from '../FileTree/FileTree';
import {getModeForFilename} from '../Editor/Editor';
import {isSmallScreen} from '../isSmallScreen';

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
      left                       : '17%',
      right                      : '17%',
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
        className={styles.button + ' ' + (anno > this.props.minAnno ? '' : styles.invisible)}
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
        {prevButton}
        {this.renderDots()}
        {anno < maxAnno ? nextButton : closeButton}
      </div>
    );
  }

  renderDots () {
    const maxAnno = this.props.annotations.size;
    const anno = this.props.currentAnnotation;

    const dots = _.range(maxAnno).map((dot) => {
      const active = anno === dot;
      return (
        <span className={active ? styles.activeDot : styles.dot} key={dot}>
          <Icon icon={'dot'} />
        </span>
      );
    });

    return (
      <div className={styles.dots}>
        {dots}
      </div>
    );
  }

  getEditors () {
    return fromJS(this.props.annotations.map((elem) => elem.get('fileName')).reduce((acc, name) => {

      if (acc.indexOf(name) === -1) {
        return acc.concat(name);
      }
      return acc;
    }, []).map((name) => ({
      name,
      highlight: []
    })));
  }

  renderAce (annotation) {
    const mode = getModeForFilename(annotation.fileName);
    return (
      <AceEditor
        height={'100%'}
        highlight={annotation.highlight}
        highlightActiveLine={false}
        mode={mode}
        name={`editor-annotations-${annotation.fileName}`}
        showGutter={false}
        showPrintMargin={false}
        theme={'chrome'}
        value={annotation.code}
        width={'100%'}
        />
    );
  }

  renderWithTree(editors, editorActive, annotation) {
    return (
      <div className={'xp-slide'}>
        <div className={'xp-column'} style={{ width: '9rem' }}>
          <FileTree
            active={editorActive}
            files={editors}
            onChange={() => {}}
            />
        </div>
        <div className={'xp-resize-column'} />
        <div className={'xp-column'} style={{ width: 'calc(100% - 9rem)' }}>
          {this.renderAce(annotation)}
        </div>
      </div>
    );
  }

  renderAnnotationsEditor (annotation) {
    const editors = this.getEditors();
    const editorActive = fromJS({
      name: annotation.fileName
    });

    if (editors.size > 1 && !isSmallScreen()) {
      return (
        <div className={styles.editor}>
          {this.renderWithTree(editors, editorActive, annotation)}
        </div>
      );
    }

    return [(
      <pre className={styles.fileName}>
        {annotation.fileName}
      </pre>
    ), (
      <div className={styles.editor}>
        {this.renderAce(annotation)}
      </div>
    )];
  }

  renderAnnotation (anno) {
    const title = this.props.title;

    if (anno === -1 && this.props.hasIntro) {
      return (
        <div className={styles.annotation}>
          <h2 className={styles.slideTitle}>{title}</h2>
          <div className={styles.annotationText}>
            {this.props.children}
          </div>
        </div>
      );
    }

    if (this.props.annotations.size <= anno) {
      return (<div />);
    }

    const annotation = this.props.annotations.get(anno).toJS();

    return (
      <div className={styles.annotation}>
        <h2 className={styles.slideTitle}>{title}</h2>
        {this.renderAnnotationsEditor(annotation)}
        <div
          className={annotation.description ? styles.slideDescription: ''}
          dangerouslySetInnerHTML={{__html: annotation.description || ''}}
          />
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
    if (this.props.annotations.size == 0 && !this.props.hasIntro) {
      return (<div />);
    }

    const anno = this.props.currentAnnotation;
    return (
      <Modal
        contentLabel={this.props.title}
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

