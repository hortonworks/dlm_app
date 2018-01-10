/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as fromCloudContainer from 'actions/cloud-container.action';
import { toEntities } from 'utils/store-util';
import { BaseState } from 'models/base-resource-state';
import { groupByKey } from 'utils/array-util';
import { WasbContainer } from 'models/wasb-container.model';
import { AwsBucket } from 'models/aws-bucket.model';
import { AdslContainer } from 'models/adsl-container.model';

export interface State {
  WASB: BaseState<WasbContainer>;
  S3: BaseState<AwsBucket>;
  ADSL: BaseState<AdslContainer>;
}

export const initialState: State = {
  WASB: {
    entities: {}
  },
  S3: {
    entities: {}
  },
  ADSL: {
    entities: {}
  }
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromCloudContainer.ActionTypes.LOAD_CONTAINERS.SUCCESS: {
      const containers = action.payload.response;
      const containersMap: any = groupByKey(containers, 'provider');
      return {
        WASB: {
          entities: Object.assign({}, state.WASB.entities, toEntities<WasbContainer>(containersMap.WASB || []))
        },
        S3: {
          entities: Object.assign({}, state.S3.entities, toEntities<AwsBucket>(containersMap.S3 || []))
        },
        ADSL: {
          entities: Object.assign({}, state.ADSL.entities, toEntities<AdslContainer>(containersMap.ADSL || []))
        }
      };
    }
    default: {
      return state;
    }
  }
}
