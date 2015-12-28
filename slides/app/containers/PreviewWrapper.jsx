import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import {Preview} from '../components/Preview';

import {getFilesWithActive} from '../reducers.utils/editors';

import * as PreviewActions from '../actions/preview';

class PreviewContainer extends React.Component {

  getFilesFromEditors () {
    const files = this.props.editors.map(getFilesWithActive);
    return files.toSetSeq().flatten(1);
  }

  runAction (runnerName) {
    const previewId = this.props.previewId;
    const runServerUrl = this.props.runServerUrl;
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
    const runnerName = preview.get('runner');

    return (
      <Preview
        previewId={id}
        isLoading={preview.get('isLoading')}
        runId={preview.get('runId')}
        runServerUrl={runServerUrl}
        onRun={this.runAction.bind(this, runnerName)}
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
  }).isRequired
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
      <PreviewContainer {...this.props} previewId={this.props.previewId}/>
    )
  }
}
PreviewContainerWrapper.propTypes = {
  previewId: React.PropTypes.string.isRequired
};
