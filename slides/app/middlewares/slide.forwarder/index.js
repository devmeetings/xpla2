// @flow

import * as actions from '../../actions'

type StateT = any;
type ActionT = any;

type StoreT = {
  getState: () => StateT,
  dispatch: (ActionT) => void
};

type EventEmitterT = {
  emit: (string, ActionT) => void
};

const forwarded = [
  actions.COMMIT_AND_RUN_CODE_STARTED,
  actions.CHANGE_ACTIVE_TAB,
  actions.MODIFY_ACTIVE_TAB_CONTENT
]

export default (globalEvents: EventEmitterT) => (store: StoreT) => {
  return (next: (ActionT) => StateT) => (action: ActionT) => {
    if (forwarded.indexOf(action.type) !== -1) {
      globalEvents.emit('slide.forward', action)
    }

    return next(action)
  }
}
