// @flow

import {bindActionCreators} from 'redux'
import React from 'react'
import {connect} from 'react-redux'
import Props from 'react-immutable-proptypes'

import * as WorkModeActions from '../actions/workMode'

import {WORK_MODE_DECK_EDIT} from '../reducers.utils/workMode'

import {Annotations} from '../components/Annotations/Annotations'
import {HtmlEditor} from '../components/HtmlEditor/HtmlEditor'

import {getFilesWithActive} from '../reducers.utils/editors'

class AnnotationsContainer extends React.Component {
  constructor (...args) {
    super(...args)

    const annotation = this.props.annotations.get('currentAnnotation')
    const annotations = this.props.annotations.get('annotations')
    const editorAnnotations = this.getEditorAnnotations(annotations, this.props.editors)

    this.state = {
      isOpen: (editorAnnotations.size > 0 || this.minAnno() === -1) && annotation < editorAnnotations.size,
      annotations: editorAnnotations,
      currentAnnotation: (annotation > 0 || annotation === 0) && !isNaN(annotation) ? annotation : this.minAnno()
    }

    this.annotationEvent(this.state.currentAnnotation)
  }

  minAnno () {
    const meta = this.props.annotations
    const details = meta.get('details')

    return (!!details || this.isEditMode) ? -1 : 0
  }

  changeAnnotation (anno) {
    const editorAnnotations = this.state.annotations
    if (this.isEditMode && anno === 0 && editorAnnotations.size === 0) {
      anno = -1
    }

    if (anno < this.minAnno()) {
      this.prevSlide()
      return
    }

    if (anno > editorAnnotations.size) {
      this.nextSlide()
      return
    }

    if (anno === editorAnnotations.size) {
      this.setState({
        isOpen: false,
        currentAnnotation: anno
      })
      this.annotationEvent(anno)
      return
    }

    this.setState({
      isOpen: true,
      currentAnnotation: anno
    })
    this.annotationEvent(anno)
  }

  updateAnnotation = (anno, content) => {
    const annotation = this.state.annotations.get(anno)
    if (!annotation) {
      return
    }

    this.props.actionsWorkMode.editEditorAnnotation({
      fileName: annotation.get('fileName'),
      order: annotation.get('order'),
      description: content
    })
  }

  componentDidMount () {
    window.addEventListener('keyup', this.onKey)
    window.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.onKey)
    window.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = (ev) => {
    if (ev.ctrlKey && ev.keyCode === 80 /* P */) {
      ev.preventDefault()
      this.props.actionsWorkMode.workModeDeckEditToggle()
      return false
    }
  };

  onKey = (ev) => {
    // Don't handle slide changes in edit mode.
    if (this.isEditMode) {
      return
    }

    const prev = [37, 38] /* LEFT,UP */
    const next = [39, 32, 40] /* RIGHT,SPACE,DOWN */
    const code = ev.keyCode

    const anno = this.state.currentAnnotation
    if (next.indexOf(code) !== -1) {
      this.changeAnnotation(anno + 1)
      return
    }

    if (prev.indexOf(code) !== -1) {
      this.changeAnnotation(anno - 1)
    }
  };

  annotationEvent (anno) {
    this.props.globalEvents.emit('slide.annotation', anno)
  }

  nextSlide () {
    this.props.globalEvents.emit('slide.next')
  }

  prevSlide () {
    this.props.globalEvents.emit('slide.prev')
  }

  getFilesFromEditors (editors) {
    const files = editors.map(getFilesWithActive)
    return files.toSetSeq().flatten(1)
  }

  getEditorAnnotations (moreAnnotations, editors) {
    const annotations = this.getFilesFromEditors(editors)
      .filter((file) => file.get('highlight').size)
      .sort((a, b) => a.get('fileOrder') - b.get('fileOrder'))
      .map((file) => {
        const fileName = file.get('name')
        const extended = moreAnnotations.get(fileName)
        const annos = file.get('annotations')

        if (!extended) {
          return annos
        }

        return annos.map((anno) => {
          const e = extended.find((a) => a.get('order') === anno.get('order'))
          if (!e) {
            return anno
          }
          return anno.set('description', e.get('content'))
        })
      })
      .flatten(1)
      .toList()
    return annotations
  }

  componentWillReceiveProps (newProps) {
    if (newProps.annotations === this.props.annotations && newProps.editors === this.props.editors) {
      return
    }

    const anno = newProps.annotations.get('currentAnnotation')
    if (anno !== this.props.annotations.get('currentAnnotation')) {
      this.changeAnnotation(anno)
    }

    const annotations = newProps.annotations.get('annotations')
    this.setState({
      annotations: this.getEditorAnnotations(annotations, newProps.editors)
    })
  }

  render () {
    const meta = this.props.annotations
    const title = meta.get('title')
    const header = meta.get('header')
    const details = meta.get('details')
    const editorAnnotations = this.state.annotations
    const anno = this.state.currentAnnotation

    return (
      <div>
        {this.asHtml(header, 'header')}
        <Annotations
          annotations={editorAnnotations}
          currentAnnotation={anno}
          hasIntro={!!details || this.isEditMode}
          isEditMode={this.isEditMode}
          isOpen={this.state.isOpen}
          minAnno={this.minAnno()}
          onNext={() => this.changeAnnotation(anno + 1)}
          onPrev={() => this.changeAnnotation(anno - 1)}
          onReopen={() => this.changeAnnotation(anno === editorAnnotations.size ? anno - 1 : anno)}
          onRequestClose={() => this.setState({isOpen: false})}
          onUpdateAnnotation={this.updateAnnotation}
          title={title}
          >
          {this.asHtml(details, 'details')}
        </Annotations>
      </div>
    )
  }

  get isEditMode () {
    return this.props.workMode === WORK_MODE_DECK_EDIT
  }

  asHtml (content, id) {
    if (this.isEditMode) {
      return (
        <HtmlEditor
          onChange={(text) => {
            this.props.actionsWorkMode.editAnnotations({
              prop: id,
              value: text
            })
          }}
          text={content}
        />
      )
    }

    return (<div dangerouslySetInnerHTML={{__html: content}} />)
  }
}

AnnotationsContainer.propTypes = {
  annotations: Props.map.isRequired,
  editors: Props.map.isRequired,
  globalEvents: React.PropTypes.object.isRequired
}

@connect(
  state => ({
    editors: state.get('editors'),
    annotations: state.get('annotations'),
    workMode: state.get('workMode').get('current')
  }),
  dispatch => ({
    actionsWorkMode: bindActionCreators(WorkModeActions, dispatch)
  })
)
export default class AnnotationsContainerWrapper extends React.Component {
  render () {
    return (
      <AnnotationsContainer {...this.props} />
    )
  }
}
AnnotationsContainerWrapper.propTypes = {
  globalEvents: React.PropTypes.object.isRequired
}
