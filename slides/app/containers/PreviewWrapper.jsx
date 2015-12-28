import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import {Preview} from '../components/Preview';

import {getFilesWithActive} from '../reducers.utils/editors';

import * as PreviewActions from '../actions/preview';

class PreviewContainer extends React.Component {

  constructor (...args) {
    super(...args);
    this.onGlobalRun = this.onGlobalRun.bind(this);
  }

  componentDidMount () {
    this.props.globalEvents.on('preview.run', this.onGlobalRun);
  }

  componentWillUnmount () {
    this.props.globalEvents.off('preview.run', this.onGlobalRun);
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

  render () {
    const id = this.props.previewId;
    const runServerUrl = this.props.runServerUrl;
    const preview = this.props.previews.get(id);

    return (
      <Preview
        previewId={id}
        isLoading={preview.get('isLoading')}
        runId={preview.get('runId')}
        runServerUrl={runServerUrl}
        onRun={this.runAction.bind(this)}
        />
    );
  }

}

PreviewContainer.propTypes = {
  previewId: React.PropTypes.string.isRequired,
  previews: Props.map.isRequired,
  editors: Props.map.isRequired,
  actions: React.PropTypes.shape({
    commitAndRunCode: React.PropTypes.func.isRequired
  }).isRequired,
  globalEvents: React.PropTypes.object.isRequired
};

@connect(
  state => ({
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
