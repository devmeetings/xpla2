/* globals angular */
"use strict";

let mod = angular.module('github-to-slides', []);

mod.component('xpUpload', {
  controller: UploadCtrl,
  templateUrl: './upload.html'
});

function UploadCtrl ($scope, $http) {
  this.url = '';
  this.branch = 'master';
  this.repo = '';
  this.username = '';
  this.response = {
    isGenerating: false,
    success: null
  };

  this.$http = $http;
  $scope.$watch(() => this.url, this.onUrlChange.bind(this));
}

Object.assign(UploadCtrl.prototype, {

  onUrlChange (url) {
    this.error = '';
    if (!url) {
      return;
    }

    let pattern = /github\.com[:\/](.+)\/(.+)$/;
    let match = pattern.exec(url);

    if (!match) {
      this.error = 'This doesn\'t look like Github repo URL';
      return;
    }

    this.username = match[1];
    this.repo = match[2].replace(/\.git$/, '');
  },

  generateSlides () {
    this.response = {
      isGenerating: true,
      success: null
    };

    this.$http.post('/api/generate', {
      username: this.username,
      repo: this.repo,
      branch: this.branch
    }).then((response) => {
      this.response = {
        isGenerating: false,
        success: true,
        msg: 'Looks like everything went well :)',
        details: response.data
      };
    }).catch((e) => {
      this.response = {
        isGenerating: false,
        success: false,
        msg: 'Error while generating slides',
        details: e.data
      };
    });
  }
});


angular.bootstrap(document, [mod.name]);
