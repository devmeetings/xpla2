/* globals angular */
'use strict';

let mod = angular.module('github-to-slides', []);

mod.component('xpUpload', {
  controller: UploadCtrl,
  templateUrl: './upload.html'
});

function load (key, defaultValue) {
  return window.localStorage.getItem('gh.slides-' + key) || defaultValue;
}
function save (key, val) {
  window.localStorage.setItem('gh.slides-' + key, val);
}

function UploadCtrl ($scope, $http) {
  this.url = load('url', '');
  this.repo = load('repo', '');
  this.username = load('username', '');
  this.branches = load('branches', 'master');
  this.workshopName = load('workshop.name', '');
  this.workshopDate = load('workshop.date', '');
  this.workshopLink = load('workshop.link', '');
  this.response = {
    isGenerating: false,
    success: null
  };

  this.$http = $http;
  $scope.$watch(() => this.url, this.onUrlChange.bind(this));
  // persistence
  ['url', 'branches', 'workshopName', 'workshopDate', 'workshopLink'].forEach(prop => {
    $scope.$watch(() => this[prop], (newVal) => {
      save(prop, newVal);
    });
  });
}

Object.assign(UploadCtrl.prototype, {

  onUrlChange (url) {
    this.error = '';
    if (!url) {
      return;
    }

    let pattern = /github\.com[:/](.+)\/(.+)$/;
    let match = pattern.exec(url);

    if (!match) {
      this.error = 'This doesn\'t look like Github repo URL';
      return;
    }

    this.username = match[1];
    this.repo = match[2].replace(/\.git$/, '');

    save('username', this.username);
    save('repo', this.repo);
  },

  generateSlides () {
    this.response = {
      isGenerating: true,
      success: null
    };

    this.$http.post('/api/generate', {
      username: this.username,
      repo: this.repo,
      branches: this.branches.split('\n'),
      workshopName: this.workshopName,
      workshopDate: this.workshopDate,
      workshopLink: this.workshopLink
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
