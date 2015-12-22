import {bindActionCreators} from 'redux';
import React from 'react';
import {connect} from 'react-redux';
import Props from 'react-immutable-proptypes';

import * as PreviewActions from '../actions/preview';

class PreviewContainer extends React.Component {


  render () {
    const id = this.props.previewId;
    const preview = this.props.previews.get(id);

    return (
      <div>
        Preview {id} = {preview}
      </div>
    );
  }

}

PreviewContainer.propTypes = {
  previewId: React.PropTypes.string.isRequired,
  previews: Props.map.isRequired,
  actions: React.PropTypes.shape({
  }).isRequired
};

@connect(
  state => ({
    previews: state.get('previews')
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
