const uuid = require('node-uuid');
const _ = require('lodash');

const store = require('./store');

const l = function (/* args */) {
  const args = [].slice.call(arguments);
  args.unshift('  [ServerRunner]');
  console.log.apply(console, args);
};

const PROMISE_TIMEOUT = 30000;
const ASYNC_ANSWEAR_TIMEOUT = 90000;

const Workers = (function () {
  const ReplyQueue = 'Replies_' + uuid();
  const answers = {};

  const deleteCallbackLater = _.debounce(function deleteCallback (id) {
    delete answers[id];
  }, ASYNC_ANSWEAR_TIMEOUT);

  const maybeAnswer = function (msgString) {
    const msg = JSON.parse(msgString);
    const id = msg.properties.correlationId;
    if (answers[id]) {
      const ans = answers[id];
      // Measure time only once!
      if (ans.timestamp) {
        const time = new Date().getTime() - ans.timestamp;
        l('Received answer in ' + time + 'ms', {
          roundtrip: time
        });
        ans.timestamp = null;
      }
      const response = msg.content;
      ans.callback(response);
      deleteCallbackLater(id);
    }
  };

  store.subscribe(ReplyQueue, maybeAnswer);

  return {
    send: function (Queue, msg) {
      l('Sending message to ' + Queue);

      const corrId = uuid();

      return new Promise((resolve, reject) => {
        const promiseTimeout = setTimeout(() => {
          l('Rejecting message due to timeout.');
          const e = new Error('Timeout error');
          e.isTimeout = true;
          reject(e);
        }, PROMISE_TIMEOUT);

        answers[corrId] = {
          timestamp: new Date().getTime(),
          callback: (data) => {
            clearTimeout(promiseTimeout);
            resolve(data);
          }
        };

        const storeMessage = {
          content: msg,
          properties: {
            replyTo: ReplyQueue,
            correlationId: corrId
          }
        };

        store.publish(Queue, JSON.stringify(storeMessage));
      });
    }
  };
}());

module.exports = Workers;
