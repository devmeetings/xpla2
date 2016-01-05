import {CHANGE_ACTIVE_TAB, MODIFY_ACTIVE_TAB_CONTENT, SAVE_WORKSPACE_AS_ZIP} from './index';
import {createAction} from 'redux-actions';

export const changeActiveTab = createAction(CHANGE_ACTIVE_TAB);
export const modifyActiveTabContent = createAction(MODIFY_ACTIVE_TAB_CONTENT);
export const saveWorkspaceAsZip = createAction(SAVE_WORKSPACE_AS_ZIP);
