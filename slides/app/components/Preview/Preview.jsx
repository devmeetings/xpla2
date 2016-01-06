import React from 'react';
import _ from 'lodash';
import Props from 'react-immutable-proptypes';

import Tooltip from '../Tooltip';

import {HtmlResult} from '../HtmlResult/HtmlResult';
import {Icon} from '../Icon/Icon';

import styles from './Preview.scss';

export class Preview extends React.Component {

  renderAlert () {
    const isTakingLong = this.props.isTakingLong;
    if (!isTakingLong) {
      return;
    }
    return (
      <div className={styles.previewAlert}>
        Your code is running longer than expected. You may be offline or you might try executing again.
      </div>
    );
  }

  renderResultWindow () {
    const runId = this.props.runId;
    const runServerUrl = this.props.runServerUrl;
    const isLoading = this.props.isLoading;
    const isError = this.props.isError;

    if (isError) {
      return (
        <div className={styles.loadingIcon}>
          <Icon icon={'clear'} size={'5em'} />
          <p>
            There was an error running your code. It means that you are offline or server is having some troubles processing your request.
          </p>
        </div>
      );
    }

    if (!runId) {
      return (
        <Tooltip
          overlay={<span>Your preview is being loaded.</span>}
          placement={'top'}
          >
          <div>
            {this.renderAlert()}
            <div className={styles.loadingIcon}>
              <Icon icon={'refresh'} size={'5em'} spin={true} />
            </div>
          </div>
        </Tooltip>
      );
    }

    return (
      <div className={styles.previewWindow}>
        {this.renderAlert()}
        <HtmlResult
          isLoading={isLoading}
          runId={runId}
          runServerUrl={runServerUrl}
        />
      </div>
    );
  }

  getBtnClass () {
    if (this.props.isFresh) {
      return styles.runButton + ' ' + styles.disabled;
    }
    return styles.runButton;
  }

  renderRunButtonText () {
    if (this.props.isLoading) {
      return (
        <span>
          <Icon icon={'restore'} spin={true} />
          &nbsp;Run Code
        </span>
      );
    }
    if (this.props.isFresh) {
      return (
        <span>
          <Icon icon={'refresh'} />
          &nbsp;Run Code
        </span>
      );
    }
    return (
      <span>
        <Icon icon={'play'} />
        &nbsp;Run Code
      </span>
    );
  }

  renderRunButton () {
    return (
      <button
        className={this.getBtnClass()}
        disabled={this.props.isLoading}
        onClick={this.props.onRun}
        >
        {this.renderRunButtonText()}
      </button>
    );
  }

  renderNewWindowButton () {
    return (
      <a
        className={styles.newTabButton}
        href={this.props.runServerUrl + '/api/results/' + this.props.runId + '/'}
        target={'_blank'}
        >
          <Icon icon={'launch'} />
      </a>
    );
  }

  render () {
    return (
      <div className={styles.preview}>
        <div className={styles.previewBar}>
          {this.renderRunButton()}
          {this.renderNewWindowButton()}
        </div>
        {this.renderResultWindow()}
      </div>
    );
  }
}

Preview.propTypes = {
  isLoading: React.PropTypes.bool.isRequired,
  isFresh: React.PropTypes.bool.isRequired,
  isTakingLong: React.PropTypes.bool.isRequired,
  isError: React.PropTypes.bool.isRequired,
  runId: React.PropTypes.string,
  runServerUrl: React.PropTypes.string.isRequired,
  onRun: React.PropTypes.func.isRequired
};
