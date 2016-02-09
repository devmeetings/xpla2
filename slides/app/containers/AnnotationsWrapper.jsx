import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import {Preview} from '../components/Preview/Preview';
import {Annotations} from '../components/Annotations/Annotations';

import {getFilesWithActive} from '../reducers.utils/editors';

class AnnotationsContainer extends React.Component {

  getFilesFromEditors () {
    const files = this.props.editors.map(getFilesWithActive);
    return files.toSetSeq().flatten(1);
  }

  getEditorAnnotations (moreAnnotations) {
    const annotations = this.getFilesFromEditors()
      .filter((file) => file.get('highlight').size)
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

    return (
      <div>
        {asHtml(header)}
        <Annotations
          hasIntro={!!details}
          annotations={editorAnnotations}
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
