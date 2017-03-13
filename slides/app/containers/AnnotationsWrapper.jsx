import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import * as WorkModeActions from '../actions/workMode';

import {WORK_MODE_DECK_EDIT} from '../reducers.utils/workMode';

import {Preview} from '../components/Preview/Preview';
import {Annotations} from '../components/Annotations/Annotations';
import {HtmlEditor} from '../components/HtmlEditor/HtmlEditor';

import {getFilesWithActive} from '../reducers.utils/editors';

class AnnotationsContainer extends React.Component {
  constructor (...args) {
    super(...args);
    this.onKey = this.onKey.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    const annotations = this.props.annotations.get('annotations');
    const editorAnnotations = this.getEditorAnnotations(annotations);

    this.state = {
      isOpen: editorAnnotations.size > 0 || this.minAnno() === -1,
      annotations: editorAnnotations,
      currentAnnotation: this.minAnno()
    };
  }

  minAnno() {
    const meta = this.props.annotations;
    const details = meta.get('details');
    return !!details ? -1 : 0;
  }

  changeAnnotation (anno) {
    const editorAnnotations = this.state.annotations;
    if (anno < this.minAnno()) {
      this.prevSlide();
      return;
    }

    if (anno > editorAnnotations.size) {
      this.nextSlide();
      return;
    }

    if (anno == editorAnnotations.size) {
      this.setState({
        isOpen: false,
        currentAnnotation: anno
      });
      return;
    }

    this.setState({
      isOpen: true,
      currentAnnotation: anno
    });
  }

  updateAnnotation = (content, anno) => {

  }

  componentDidMount () {
    window.addEventListener('keyup', this.onKey);
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.onKey);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown (ev) {
    if (ev.ctrlKey && ev.keyCode === 80 /* P */) {
      ev.preventDefault();
      this.props.actionsWorkMode.workModeDeckEditToggle();
      return false;
    }
  }

  onKey (ev) {
    // Don't handle slide changes in edit mode.
    if (this.isEditMode) {
      return;
    }

    const prev = [37/* LEFT */, 38/* UP */];
    const next = [39/* RIGHT */, 32/* SPACE*/, 40/* DOWN */];
    const code = ev.keyCode;

    const anno = this.state.currentAnnotation;
    if (next.indexOf(code) !== -1) {
      this.changeAnnotation(anno + 1);
      return;
    }

    if (prev.indexOf(code) !== -1) {
      this.changeAnnotation(anno - 1);
      return;
    }
  }

  nextSlide () {
    this.props.globalEvents.emit('slide.next');
  }

  prevSlide () {
    this.props.globalEvents.emit('slide.prev');
  }

  getFilesFromEditors () {
    const files = this.props.editors.map(getFilesWithActive);
    return files.toSetSeq().flatten(1);
  }

  getEditorAnnotations (moreAnnotations) {
    const annotations = this.getFilesFromEditors()
      .filter((file) => file.get('highlight').size)
      .sort((a, b) => a.get('fileOrder') - b.get('fileOrder'))
      .map((file) => {
        const fileName = file.get('name');
        const extended = moreAnnotations.get(fileName);
        const annos = file.get('annotations');

        if (!extended) {
          return annos;
        }

        return annos.map((anno) => {
          const e = extended.find((a) => a.get('order') === anno.get('order'));
          if (!e) {
            return anno;
          }
          return anno.set('description', e.get('content'));
        });
      })
      .flatten(1)
      .toList();
    return annotations;
  }

  render () {
    const meta = this.props.annotations;
    const title = meta.get('title');
    const header = meta.get('header');
    const details = meta.get('details');
    const annotations = meta.get('annotations');
    const editorAnnotations = this.getEditorAnnotations(annotations);
    const anno = this.state.currentAnnotation;

    return (
      <div>
        {this.asHtml(header, 'header')}
        <Annotations
          annotations={editorAnnotations}
          currentAnnotation={anno}
          hasIntro={!!details}
          isOpen={this.state.isOpen}
          minAnno={this.minAnno()}
          onNext={() => this.changeAnnotation(anno + 1)}
          onPrev={() => this.changeAnnotation(anno - 1)}
          onRequestClose={() => this.setState({isOpen: false})}
          title={title}
          isEditMode={this.isEditMode}
          onUpdateAnnotation={this.updateAnnotation}
          >
          {this.asHtml(details, 'details')}
        </Annotations>
      </div>
    );
  }

  get isEditMode () {
    return this.props.workMode === WORK_MODE_DECK_EDIT;
  }

  asHtml (content, id) {
    if (this.isEditMode) {
      return (
        <HtmlEditor
          text={content}
          onChange={(text) => {
            this.props.actionsWorkMode.editAnnotations({
              prop: id,
              value: text,
            })
          }}
        />
      );
    }

    return (<div dangerouslySetInnerHTML={{__html: content}} />);
  }


}

AnnotationsContainer.propTypes = {
  annotations: Props.map.isRequired,
  editors: Props.map.isRequired,
  globalEvents: React.PropTypes.object.isRequired
};

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
  render() {
    return (
      <AnnotationsContainer {...this.props} />
    )
  }
}
AnnotationsContainerWrapper.propTypes = {
  globalEvents: React.PropTypes.object.isRequired
};
