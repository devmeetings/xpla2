import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

export class HtmlResult extends React.Component {

  render () {
    const runId = this.props.runId;
    const runServerUrl = this.props.runServerUrl;

    return (
      <iframe
        src={`${runServerUrl}/api/results/${runId}/`}
        seamless
        ></iframe>
    );
  }

}

HtmlResult.propTypes = {
  runId: React.PropTypes.string.isRequired,
  runServerUrl: React.PropTypes.string.isRequired
}
