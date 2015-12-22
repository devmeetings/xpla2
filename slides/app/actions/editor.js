import {CHANGE_ACTIVE_TAB, MODIFY_ACTIVE_TAB_CONTENT} from './index';
import {createAction} from 'redux-actions';

export const changeActiveTab = createAction(CHANGE_ACTIVE_TAB);
export const modifyActiveTabContent = createAction(MODIFY_ACTIVE_TAB_CONTENT);
