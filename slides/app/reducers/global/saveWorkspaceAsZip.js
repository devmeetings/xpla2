// @flow

import JSZip from 'jszip';
import _ from 'lodash';

import {getFilesWithActiveAsJsArray} from '../../reducers.utils/editors';
import {saveBlob} from '../../reducers.utils/saveFile';

export function saveWorkspaceAsZip (imState: any) {
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
  const name = `xpla_workspace_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}_${now.getHours()}:${now.getMinutes()}.zip`;

  saveBlob(zip.generate({
    type: 'blob'
  }), name);

  return imState;
};

