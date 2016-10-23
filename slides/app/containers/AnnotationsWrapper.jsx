import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import {Preview} from '../components/Preview/Preview';
import {Annotations} from '../components/Annotations/Annotations';

import {getFilesWithActive} from '../reducers.utils/editors';

class AnnotationsContainer extends React.Component {
  constructor (...args) {
    super(...args);
    this.onKey = this.onKey.bind(this);

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

  componentDidMount () {
    window.addEventListener('keyup', this.onKey);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.onKey);
  }

  onKey (ev) {
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
        {asHtml(header)}
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
          >
          {asHtml(details)}
        </Annotations>
      </div>
    );
  }

}

function asHtml(content) {
  return (<div dangerouslySetInnerHTML={{__html: content}}></div>);
}

AnnotationsContainer.propTypes = {
  annotations: Props.map.isRequired,
  editors: Props.map.isRequired,
  globalEvents: React.PropTypes.object.isRequired
};

@connect(
  state => ({
    editors: state.get('editors'),
    annotations: state.get('annotations')
  }),
  dispatch => ({
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
