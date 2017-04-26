import {WORK_MODE_VIEW, WORK_MODE_DECK_EDIT} from '../reducers.utils/workMode'

import {WORK_MODE_SWITCH, WORK_MODE_DECK_EDIT_TOGGLE} from '../actions'

import {fromJS} from 'immutable'
import {createReducer} from 'redux-immutablejs'

export default createReducer(fromJS({
  current: WORK_MODE_VIEW
}), {

  [WORK_MODE_SWITCH]: (workMode, action) => {
    return action.payload
  },

  [WORK_MODE_DECK_EDIT_TOGGLE]: (workMode, action) => {
    const map = {
      [WORK_MODE_VIEW]: WORK_MODE_DECK_EDIT,
      [WORK_MODE_DECK_EDIT]: WORK_MODE_VIEW
    }

    return fromJS({
      current: map[workMode.get('current')]
    })
  }

})
