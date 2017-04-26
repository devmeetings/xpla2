import {WORK_MODE_SAVE_SLIDE, SAVE_WORKSPACE_AS_ZIP} from '../../actions'
import {saveSlide} from './saveSlide'
import {saveWorkspaceAsZip} from './saveWorkspaceAsZip'

export default function (state, action) {
  switch (action.type) {
    case WORK_MODE_SAVE_SLIDE:
      return saveSlide(state, action)
    case SAVE_WORKSPACE_AS_ZIP:
      return saveWorkspaceAsZip(state, action)
  }
  return state
}
