const _ = require('lodash');

module.exports = function (v) {
  return {
    success: true,
    files: _.values(v.files)
  };
};
