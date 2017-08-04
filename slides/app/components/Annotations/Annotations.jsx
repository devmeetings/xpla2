import React from 'react'
import _ from 'lodash'
import classnames from 'classnames'
import Props from 'react-immutable-proptypes'

// TODO [todr] This is very temporary!
import {fromJS} from 'immutable'

import Modal from 'react-modal'
import {Icon} from '../Icon/Icon'
import {AceEditor} from '../AceEditor/AceEditor'
import {FileTree} from '../FileTree/FileTree'
import {getModeForFilename} from '../Editor/Editor'

import {HtmlEditor} from '../HtmlEditor/HtmlEditor'

import styles from './Annotations.scss'

export class Annotations extends React.Component {
  renderButtons (anno) {
    const prevButton = (
      <button
        className={styles.button + ' ' + (anno > this.props.minAnno ? '' : styles.invisible)}
        onClick={this.props.onPrev}
        >
        <Icon icon={'chevron-left'} />
      </button>
    )
    const nextButton = (
      <button
        className={styles.button}
        onClick={this.props.onNext}
        >
        <Icon icon={'chevron-right'} /> Next
      </button>
    )
    const closeButton = (
      <button
        className={styles.button}
        onClick={this.props.onNext}
        >
        <Icon icon={'chevron-right'} /> Ok. I get it
      </button>
    )
    const maxAnno = this.props.annotations.size - 1

    return (
      <div className={styles.buttonBar}>
        {prevButton}
        {this.renderDots()}
        {anno < maxAnno ? nextButton : closeButton}
      </div>
    )
  }

  renderDots () {
    const maxAnno = this.props.annotations.size
    const anno = this.props.currentAnnotation

    const dots = _.range(maxAnno).map((dot) => {
      const active = anno === dot
      return (
        <span className={active ? styles.activeDot : styles.dot} key={dot}>
          <Icon icon={'dot'} />
        </span>
      )
    })

    return (
      <div className={styles.dots}>
        {dots}
      </div>
    )
  }

  getEditors () {
    return fromJS(this.props.annotations.map((elem) => elem.get('fileName')).reduce((acc, name) => {
      if (acc.indexOf(name) === -1) {
        return acc.concat(name)
      }
      return acc
    }, []).map((name) => ({
      name,
      highlight: []
    })))
  }

  renderAce (annotation) {
    const mode = getModeForFilename(annotation.fileName)
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
    )
  }

  selectAnnotationWithFile = (file) => {
    const name = file.get('name')
    const anno = this.props.annotations.findIndex(elem => elem.get('fileName') === name)

    this.props.onJumpTo(anno)
  }

  renderWithTree (editors, editorActive, annotation) {
    return (
      <div className={'xp-slide'}>
        <div className={'xp-column'} style={{ width: '9rem' }}>
          <FileTree
            active={editorActive}
            files={editors}
            onChange={this.selectAnnotationWithFile}
            />
        </div>
        <div className={'xp-resize-column'} />
        <div className={'xp-column'} style={{ width: 'calc(100% - 9rem)' }}>
          {this.renderAce(annotation)}
        </div>
      </div>
    )
  }

  renderAnnotationsEditor (annotation) {
    const editors = this.getEditors()
    const editorActive = fromJS({
      name: annotation.fileName
    })

    if (editors.size > 1) {
      return (
        <div className={styles.editor}>
          {this.renderWithTree(editors, editorActive, annotation)}
        </div>
      )
    }

    return [(
      <pre className={styles.fileName}>
        {annotation.fileName}
      </pre>
    ), (
      <div className={styles.editor}>
        {this.renderAce(annotation)}
      </div>
    )]
  }

  componentDidUpdate (prevProps) {
    if (this.props.currentAnnotation === prevProps.currentAnnotation) {
      return
    }

    // TODO [ToDr] Crappy.
    setTimeout(() => {
      if (!this.div) {
        return
      }

      const audio = this.div.querySelector('audio')
      if (audio) {
        audio.autoplay = true
        audio.play()
      }
    })
  }

  onRef = (div) => {
    this.div = div
  };

  renderAnnotation (anno) {
    const title = this.props.title

    if (anno === -1 && (this.props.hasIntro || this.props.isEditMode)) {
      const clazz = classnames(styles.annotationText, {
        [styles.editMode]: this.props.isEditMode
      })

      return (
        <div className={styles.annotation}>
          <h2 className={styles.slideTitle}>{title}</h2>
          <div className={clazz}>
            {this.props.children}
          </div>
        </div>
      )
    }

    if (this.props.annotations.size <= anno) {
      return (<div />)
    }

    const annotation = this.props.annotations.get(anno).toJS()
    const clazz = classnames({
      [styles.slideDescription]: annotation.description,
      [styles.editMode]: this.props.isEditMode
    })

    return (
      <div className={styles.annotation}>
        <h2 className={styles.slideTitle}>{title}</h2>
        {this.renderAnnotationsEditor(annotation)}
        {this.props.isEditMode ? (
          <div className={clazz}>
            <HtmlEditor
              onChange={(text) => this.props.onUpdateAnnotation(anno, text)}
              text={annotation.description || ''}
            />
          </div>
        ) : (
          <div
            className={clazz}
            dangerouslySetInnerHTML={{__html: annotation.description || ''}}
            ref={this.onRef}
          />
        )}
      </div>
    )
  }

  renderClose () {
    return (
      <a
        className={styles.close}
        onClick={this.props.onRequestClose}>
        <Icon icon='clear' />
      </a>
    )
  }

  render () {
    const {hasIntro, isEditMode, isOpen} = this.props

    if (this.props.annotations.size === 0 && !hasIntro && !isEditMode) {
      return (<div />)
    }

    const reopen = classnames(styles.reopen, {
      [styles.reopenVisible]: !isOpen
    })
    const anno = this.props.currentAnnotation
    const isFs = !this.props.isModal

    return (
      <div>
        <button
          className={reopen}
          onClick={this.props.onReopen}
          title={'Display walkthrough'}
          >
          <Icon icon='receipt' />
        </button>
        <Modal
          className={classnames(styles.modal, {[styles.fs]: isFs})}
          contentLabel={this.props.title}
          isOpen={isOpen}
          onRequestClose={this.props.onRequestClose}
          overlayClassName={classnames(styles.modalOverlay, {[styles.fs]: isFs})}
          >
          {this.renderClose()}
          {this.renderAnnotation(anno)}
          {this.renderButtons(anno)}
        </Modal>
      </div>
    )
  }
}

Annotations.propTypes = {
  hasIntro: React.PropTypes.bool.isRequired,
  isModal: React.PropTypes.bool.isRequired,
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
  onJumpTo: React.PropTypes.func.isRequired,
  onNext: React.PropTypes.func.isRequired,
  onPrev: React.PropTypes.func.isRequired,
  onReopen: React.PropTypes.func.isRequired,
  isEditMode: React.PropTypes.bool,
  onUpdateAnnotation: React.PropTypes.func
}
