// @flow

import {Synth} from 'tone';
import localforage from 'localforage';

import {STATE_NORMAL, STATE_RECORDING, VIEW_NORMAL, VIEW_ADMIN} from '../../reducers.utils/recordings';

import {RECORDING_STATE_TOGGLE, RECORDING_VIEW_TOGGLE, RECORDING_RESET, RECORDING_SET} from '../../actions';
import {setRecordings} from '../../actions/deck';

type StateT = any;
type ActionT = any;

type StoreT = {
  getState: () => StateT,
  dispatch: (ActionT) => void
};


export default (store: StoreT) => {
  const middleware = new RecordingsMiddleware(store);

  middleware.loadRecordings((recordings, started) => {
    store.dispatch(setRecordings({
      recordings, started
    }));
  });

  return (next: (ActionT) => StateT)  => (action: ActionT) => {
    const ret = next(action);

    if (action.type === RECORDING_STATE_TOGGLE) {
      middleware.onToggleState();
    }

    if (action.type === RECORDING_RESET) {
      middleware.resetPersistence();
    }

    middleware.persistIfNeeded();

    return ret;
  };
}

const RECORDINGS = 'xpla::recordings';
const STARTED = 'started';

class RecordingsMiddleware {
  synth = new Synth().toMaster();
  store: StoreT;

  constructor (store) {
    this.store = store;
    localforage.config({
      version: 1.0,
      storeName: 'xpla::recordings',
      description: 'Efficient persistence of xpla recorded actions.'
    });
  }

  get recordings () {
    return this.store.getState().get('recordings');
  }

  get isRecording () {
    return this.recordings.get('state') === STATE_RECORDING;
  }

  loadRecordings (cb) {
    localforage.keys().then(keys => {
      if (!keys.length) {
        return;
      }

      console.log(keys);
      const recordings = keys.filter(key => key !== STARTED).map(key => localforage.getItem(key));
      recordings.push(localforage.getItem(STARTED));
      return Promise.all(recordings);
    }).then(recordings => {
      if (!recordings) {
        return;
      }

      const started = recordings.pop();
      return cb(recordings, started);
    }).catch(err => console.error(err));
  }

  resetPersistence () {
    localforage.clear();
  }

  persistIfNeeded () {
    if (!this.isRecording) {
      return;
    }

    const rec = this.recordings.get('recordings');
    if (rec.size === 0) {
      return;
    }

    const lastRec = rec.get(rec.size - 1);
    localforage.setItem(`rec:${lastRec.get('timestamp')}`, lastRec.toJS());
  }

  onToggleState () {
    if (this.isRecording) {
      this.synth.triggerAttackRelease('A6', '4n');
      localforage.setItem(STARTED, this.recordings.get('started'));
    } else {
      this.synth.triggerAttackRelease('E3', '16n');
    }
  }
}
