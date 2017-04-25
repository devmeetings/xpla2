'use strict';

const stats = require('../storage/stats');

module.exports = {
  get () {
    return stats.getAll();
  },

  note (origin, referer, call) {
    return stats.retrieve(origin)
      .then(data => {
        data[call] = data[call] || 0;
        data[call] += 1;
        data.lastCall = new Date();
        data.lastReferer = referer;

        return stats.store(origin, data);
      })
      .catch(e => {
        return stats.store(origin, {
          [call]: 1,
          lastCall: new Date(),
          lastReferer: referer
        });
      });
  }
};
