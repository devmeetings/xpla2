import JSZip from 'jszip';
import _ from 'lodash';

import {getFilesWithActiveAsJsArray} from '../../reducers.utils/editors';
import {saveBlob} from './saveFile';

export function saveWorkspaceAsZip (imState, action) {
  const state = imState.toJS();

  const files = _.values(state.editors).reduce((files, editor) => {
    const editorFiles = getFilesWithActiveAsJsArray(editor);
    return files.concat(editorFiles);
  }, []);

  const zip = files.reduce((zip, file) => {
    return zip.file(file.name, file.content, {
      createFolders: true
    });
  }, new JSZip());

  const now = new Date();
  saveBlob(zip.generate({
    type: 'blob'
  }), `xpla_workspace_${1900 + now.getYear()}-${now.getMonth()+1}-${now.getDate()}_${now.getHours()}:${now.getMinutes()}.zip`);

  return imState;
};

