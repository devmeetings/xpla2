import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import * as SlideActions from '../actions/slide';

import {Editor} from '../components/Editor';

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

  render () {
    const id = this.props.editorId;
    const editor = this.props.editors.get(id);

    return (
      <Editor
        key={id}
        id={id}
        files={editor.get('files')}
        active={editor.get('active')}
        onTabChange={this.changeTab}
        onTabContentChange={this.changeTabContent}
        />
    );
  }

}

EditorContainer.propTypes = {
  editors: Props.map.isRequired,
  actions: React.PropTypes.shape({
    changeActiveTab: React.PropTypes.func.isRequired
  }).isRequired
};

@connect(
  state => ({
    editors: state.get('editors')
  }),
  dispatch => ({
    actions: bindActionCreators(SlideActions, dispatch)
  })
)
export default class EditorContainerWrapper extends React.Component {
  render() {
    return (
      <EditorContainer {...this.props} id={this.props.editorId}/>
    )
  }
}
EditorContainerWrapper.propTypes = {
  editorId: React.PropTypes.string.isRequired
};
