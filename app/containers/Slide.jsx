import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import * as SlideActions from '../actions/slide';

import {Editor} from '../components/Editor';

class Slide extends React.Component {

  changeTab (editor, tab) {
    this.props.actions.changeActiveTab({
      editorId: editor.get('id'),
      tabName: tab.get('name')
    });
  }

  renderEditors () {
    return this.props.editors.map((editor, id) => {
      return (
        <Editor
          key={id}
          id={id}
          files={editor.get('files')}
          active={editor.get('active')}
          onTabChange={this.changeTab.bind(this, editor)}
          />
      );
    }).toIndexedSeq();
  }

  render () {
    return (
      <div>
        {this.renderEditors()}
      </div>
    );
  }

}

Slide.propTypes = {
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
export default class SlideContainer extends React.Component {
  render() {
    return (
      <Slide {...this.props} />
    )
  }
}
SlideContainer.propTypes = {};
