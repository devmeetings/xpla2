import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import styles from './HtmlResult.scss';

export class HtmlResult extends React.Component {

  render () {
    const runId = this.props.runId;
    const runServerUrl = this.props.runServerUrl;
    const isLoading = this.props.isLoading;
    const file = this.props.file;

    return (
      <iframe
        className={isLoading ? styles.resultLoading : styles.result}
        seamless
        src={`${runServerUrl}/api/results/${runId}/${file}`}
        />
    );
  }

}

HtmlResult.propTypes = {
  runId: React.PropTypes.string.isRequired,
  isLoading: React.PropTypes.bool.isRequired,
  runServerUrl: React.PropTypes.string.isRequired
}
