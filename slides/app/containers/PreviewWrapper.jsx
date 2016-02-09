import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import {Preview} from '../components/Preview/Preview';
import {Annotations} from '../components/Annotations/Annotations';

import {getFilesWithActive} from '../reducers.utils/editors';

import * as PreviewActions from '../actions/preview';

class PreviewContainer extends React.Component {

  constructor (...args) {
    super(...args);
    this.onGlobalRun = this.onGlobalRun.bind(this);
  }

  componentDidMount () {
    this.props.globalEvents.on('preview.run', this.onGlobalRun);
    this.triggerRunOnStart();
  }

  componentWillUnmount () {
    this.props.globalEvents.off('preview.run', this.onGlobalRun);
  }

  triggerRunOnStart () {
    const preview = this.props.previews.get(this.props.previewId);
    if (!preview.get('runOnStart')) {
      return;
    }
    this.onGlobalRun();
  }

  onGlobalRun () {
    this.runAction();
  }

  getFilesFromEditors () {
    const files = this.props.editors.map(getFilesWithActive);
    return files.toSetSeq().flatten(1);
  }

  runAction () {
    const previewId = this.props.previewId;
    const preview = this.props.previews.get(previewId);
    const runServerUrl = this.props.runServerUrl;

    const runnerName = preview.get('runner');
    const files = this.getFilesFromEditors();

    this.props.actions.commitAndRunCode({
      runServerUrl: runServerUrl,
      previewId: previewId,
      runnerName: runnerName,
      files: files.toJS()
    });
  }

  getAnnotations () {
    const annotations = this.getFilesFromEditors()
      .filter((file) => file.get('highlight').size)
      .map((file) => file.get('annotations'))
      .flatten(1)
      .toList();
    return annotations;
  }

  render () {
    const id = this.props.previewId;
    const runServerUrl = this.props.runServerUrl;
    const preview = this.props.previews.get(id);
    const title = this.props.slideTitle;
    const annotations = this.getAnnotations();

    return (
      <div>
        <Preview
          isError={preview.get('isError')}
          isFresh={preview.get('isFresh')}
          isLoading={preview.get('isLoading')}
          isTakingLong={preview.get('isTakingLong')}
          onRun={this.runAction.bind(this)}
          previewId={id}
          runId={preview.get('runId')}
          runServerUrl={runServerUrl}
          />
        <Annotations
          annotations={annotations}
          title={title}
          />
      </div>
    );
  }

}

PreviewContainer.propTypes = {
  previewId: React.PropTypes.string.isRequired,
  slideTitle: React.PropTypes.string.isRequired,
  previews: Props.map.isRequired,
  editors: Props.map.isRequired,
  actions: React.PropTypes.shape({
    commitAndRunCode: React.PropTypes.func.isRequired
  }).isRequired,
  globalEvents: React.PropTypes.object.isRequired
};

@connect(
  state => ({
    slideTitle: state.get('title'),
    previews: state.get('previews'),
    editors: state.get('editors'),
    runServerUrl: state.get('runServerUrl')
  }),
  dispatch => ({
    actions: bindActionCreators(PreviewActions, dispatch)
  })
)
export default class PreviewContainerWrapper extends React.Component {
  render() {
    return (
      <PreviewContainer {...this.props} />
    )
  }
}
PreviewContainerWrapper.propTypes = {
  previewId: React.PropTypes.string.isRequired,
  globalEvents: React.PropTypes.object.isRequired
};
