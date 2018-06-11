/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
