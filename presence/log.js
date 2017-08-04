// @flow

const winston = require('winston');

winston.configure({
  transports: [
    new (winston.transports.File)({
      filename: process.env.LOGS || 'presence.log'
    })
  ]
});

module.exports = winston;
