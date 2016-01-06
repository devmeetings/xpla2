const redis = require('redis');
const redisUrl = require('redis-url');

const config = require('../config');

const redisAddress = redisUrl.parse(config.redis);
const client = redis.createClient(redisAddress.port, redisAddress.hostname);
const client2 = redis.createClient(redisAddress.port, redisAddress.hostname);

const subscribtions = {};

client2.on('message', function (channel, msg) {
  'use strict';

  if (!subscribtions[channel]) {
    return;
  }

  subscribtions[channel].forEach(function (cb) {
    cb(msg);
  });
});

module.exports = {
  get: function (key) {
    return ninvoke(client, 'get', key);
  },

  set: function (key, value) {
    return ninvoke(client, 'set', key, value);
  },

  del: function (key) {
    return ninvoke(client, 'del', key);
  },

  sadd: function (key, value) {
    return ninvoke(client, 'sadd', key, value);
  },

  smembers: function (key) {
    return ninvoke(client, 'smembers', key);
  },

  hset: function (key, field, value) {
    return ninvoke(client, 'hset', key, field, value);
  },

  hdel: function (key, field) {
    return ninvoke(client, 'hdel', key, field);
  },

  hgetall: function (key) {
    return ninvoke(client, 'hgetall', key);
  },

  hincrby: function (key, field, value) {
    return ninvoke(client, 'hincrby', key, field, value);
  },

  subscribe: function (channelName, callback) {
    subscribtions[channelName] = subscribtions[channelName] || [];
    subscribtions[channelName].push(callback);
    client2.subscribe(channelName);
  },

  publish: function (channelName, message) {
    client.publish(channelName, message);
  }
};

function ninvoke (obj, method /* args */) {
  const args = [].slice.call(arguments, 2);
  // invoke method and return a promise
  return new Promise((resolve, reject) => {
    args.push(function (err /* args */) {
      // add callback method
      const args = [].slice.call(arguments, 1);
      if (err) {
        return reject(err);
      }
      resolve.apply(null, args);
    });

    obj[method].apply(obj, args);
  });
}
