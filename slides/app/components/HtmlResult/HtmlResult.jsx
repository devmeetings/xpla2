import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import styles from './HtmlResult.scss';

export class HtmlResult extends React.Component {

  render () {
    const runId = this.props.runId;
    const runServerUrl = this.props.runServerUrl;
    const isLoading = this.props.isLoading;

    return (
      <iframe
        className={isLoading ? styles.resultLoading : styles.result}
        src={`${runServerUrl}/api/results/${runId}/`}
        seamless
        ></iframe>
    );
  }

}

HtmlResult.propTypes = {
  runId: React.PropTypes.string.isRequired,
  isLoading: React.PropTypes.bool.isRequired,
  runServerUrl: React.PropTypes.string.isRequired
}
