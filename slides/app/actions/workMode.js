import {WORK_MODE_SWITCH, WORK_MODE_DECK_EDIT_TOGGLE, WORK_MODE_SAVE_SLIDE, WORK_MODE_EDIT_ANNOTATIONS, WORK_MODE_EDIT_EDITOR_ANNOTATION} from './index'
import {createAction} from 'redux-actions'

export const workModeSwitch = createAction(WORK_MODE_SWITCH)
export const workModeDeckEditToggle = createAction(WORK_MODE_DECK_EDIT_TOGGLE)

export const saveCurrentSlide = createAction(WORK_MODE_SAVE_SLIDE)
export const editAnnotations = createAction(WORK_MODE_EDIT_ANNOTATIONS)
export const editEditorAnnotation = createAction(WORK_MODE_EDIT_EDITOR_ANNOTATION)
