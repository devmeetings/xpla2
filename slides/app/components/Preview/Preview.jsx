import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import {HtmlResult} from '../HtmlResult/HtmlResult';

import styles from './Preview.scss';

export class Preview extends React.Component {

  renderResultWindow () {
    const runId = this.props.runId;
    const runServerUrl = this.props.runServerUrl;

    if (!runId) {
      return;
    }

    return (
      <HtmlResult
        runId={runId}
        runServerUrl={runServerUrl}
      />
    );
  }

  render () {
    return (
      <div
        className={styles.preview}
        >
        <div
          className={styles.previewBar}
          >
          <button
            className={styles.runButton}
            disabled={this.props.isLoading}
            onClick={this.props.onRun}
            >
            Run
          </button>
          <a
            target={'_blank'}
            className={styles.runButton}
            href={this.props.runServerUrl + '/api/results/' + this.props.runId + '/'}
          >
            &gt;
          </a>
        </div>
        {this.renderResultWindow()}
      </div>
    );
  }
}

Preview.propTypes = {
  isLoading: React.PropTypes.bool.isRequired,
  runId: React.PropTypes.string,
  runServerUrl: React.PropTypes.string.isRequired,
  onRun: React.PropTypes.func.isRequired
};
