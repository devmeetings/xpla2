import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import {WORK_MODE_DECK_EDIT} from '../reducers.utils/workMode';

import * as EditorActions from '../actions/editor';
import * as WorkModeActions from '../actions/workMode';

import {Editor} from '../components/Editor/Editor';

class EditorContainer extends React.Component {

  changeTab = (tab) => {
    this.props.actions.changeActiveTab({
      editorId: this.props.editorId,
      tabName: tab.get('name')
    });
  }

  changeTabContent = (content) => {
    this.props.actions.modifyActiveTabContent({
      editorId: this.props.editorId,
      content: content
    });
  }

  saveWorkspaceAsZip = () => {
    this.props.actions.saveWorkspaceAsZip({
      editorId: this.props.editorId
    });
  }

  saveAndRunOrSaveSlide = (data) => {
    if (this.props.workMode === WORK_MODE_DECK_EDIT) {
      this.props.actionsWorkMode.saveCurrentSlide();
    }
    this.saveAndRunCode(data);
  }

  saveAndRunCode = (data) => {
    this.props.globalEvents.emit('preview.run', data);
  }

  toggleWorkMode = () => {
    this.props.actionsWorkMode.workModeDeckEditToggle();
  }

  render () {
    const id = this.props.editorId;
    const editor = this.props.editors.get(id);

    return (
      <Editor
        active={editor.get('active')}
        files={editor.get('files')}
        id={id}
        key={id}
        onRunAction={this.saveAndRunCode}
        onSaveAction={this.saveAndRunOrSaveSlide}
        onSaveWorkspaceAsZipAction={this.saveWorkspaceAsZip}
        onTabChange={this.changeTab}
        onTabContentChange={this.changeTabContent}
        onWorkModeToggle={this.toggleWorkMode}
        workMode={this.props.workMode}
        />
    );
  }

}

EditorContainer.propTypes = {
  editorId: React.PropTypes.string.isRequired,
  workMode: React.PropTypes.string.isRequired,
  editors: Props.map.isRequired,
  actions: React.PropTypes.shape({
    changeActiveTab: React.PropTypes.func.isRequired,
    modifyActiveTabContent: React.PropTypes.func.isRequired
  }).isRequired,
  globalEvents: React.PropTypes.object.isRequired
};

@connect(
  state => ({
    editors: state.get('editors'),
    workMode: state.get('workMode').get('current')
  }),
  dispatch => ({
    actions: bindActionCreators(EditorActions, dispatch),
    actionsWorkMode: bindActionCreators(WorkModeActions, dispatch)
  })
)
export default class EditorContainerWrapper extends React.Component {
  render() {
    return (
      <EditorContainer {...this.props} />
    )
  }
}
EditorContainerWrapper.propTypes = {
  editorId: React.PropTypes.string.isRequired,
  globalEvents: React.PropTypes.object.isRequired
};
