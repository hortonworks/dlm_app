/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as fromCloudAccount from 'actions/cloud-account.action';
import { toEntities } from 'utils/store-util';
import { WasbAccount } from 'models/wasb-account.model';
import { BaseState } from 'models/base-resource-state';
import { AwsAccount } from 'models/aws-account.model';
import { groupByKey } from 'utils/array-util';
import { AdslAccount } from 'models/adsl-account.model';

export interface State {
  WASB: BaseState<WasbAccount>;
  S3: BaseState<AwsAccount>;
  ADSL: BaseState<AdslAccount>;
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
    case fromCloudAccount.ActionTypes.LOAD_ACCOUNTS.SUCCESS: {
      const accounts = action.payload.response.accounts;
      const accountsMap: any = groupByKey(accounts, 'accountDetails.provider');
      return {
        WASB: {
          entities: Object.assign({}, state.WASB.entities, toEntities<WasbAccount>(accountsMap.WASB || []))
        },
        S3: {
          entities: Object.assign({}, state.S3.entities, toEntities<AwsAccount>(accountsMap.S3 || []))
        },
        ADSL: {
          entities: Object.assign({}, state.ADSL.entities, toEntities<AdslAccount>(accountsMap.ADSL || []))
        }
      };
    }
    default: {
      return state;
    }
  }
}
