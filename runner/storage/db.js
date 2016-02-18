'use strict';

const REMOVE_CHUNK = 1024;
const LIMIT = REMOVE_CHUNK * 32;

module.exports = function newDb () {
  const mem = {};
  const memIds = [];
  const pendingRemovals = new Set();
  const pendingCacheUpdates = new Set();
  let scheduledRemoval = false;
  let scheduledCacheUpdate = false;

  function updateRemovalsLater () {
    if (scheduledRemoval) {
      return;
    }
    scheduledRemoval = true;
    setTimeout(() => {
      pendingRemovals.forEach((id) => {
        delete mem[id];
      });
      pendingRemovals.clear();
      scheduledRemoval = false;
    }, 5000);
  }

  function updateCacheLater () {
    if (scheduledCacheUpdate) {
      return;
    }
    scheduledCacheUpdate = true;

    setTimeout(() => {
      pendingCacheUpdates.forEach((id) => {
        let idx = memIds.indexOf(id);
        // Do nothing if it's already at the end
        if (idx === memIds.length - 1) {
          return;
        }
        // Remove
        memIds.splice(idx, 1);
        // And push back
        memIds.push(id);
      });
      pendingCacheUpdates.clear();
      scheduledCacheUpdate = false;
    }, 3000);
  }

  return {
    store (id, val) {
      mem[id] = val;
      memIds.push(id);

      if (memIds.length >= LIMIT) {
        // Remove couple of elements from the begining
        const removed = memIds.splice(0, REMOVE_CHUNK);
        removed.map((r) => {
          pendingRemovals.add(r);
        });
        updateRemovalsLater();
      }
    },

    retrieve (id) {
      const val = mem[id];
      if (val) {
        pendingCacheUpdates.add(id);
        updateCacheLater();
      }
      return val;
    }
  };
};
