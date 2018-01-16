/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { CloudContainerItem } from 'models/cloud-container-item.model';
import { BaseState } from 'models/base-resource-state';
import * as fromCloudContainer from 'actions/cloud-container.action';

export type State = BaseState<{ [containerId: string]: CloudContainerItem[] }>;

export const initialState: State = {
  entities: {}
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromCloudContainer.ActionTypes.LOAD_DIR.SUCCESS:
      return listDirSuccess(state, action);

    default:
      return state;
  }
}

function listDirSuccess(state = initialState, action): State {
  const {container, path} = action.payload.meta;
  const dirContent = action.payload.response.fileList;
  const dirsAndFiles = dirContent.reduce((entities: { [path: string]: CloudContainerItem }, entity: CloudContainerItem) => {
    return Object.assign({}, entities, {
      [entity.pathSuffix]: entity
    });
  }, {});
  const key: any = <any>container.id;
  if (key && !(key in state.entities)) {
    state.entities[container.id] = {};
  }
  return {
    entities: Object.assign({}, state.entities, {
      [container.id]: Object.assign(
        {},
        state.entities[container.id],
        {[path]: dirsAndFiles}
      )
    })
  };
}
