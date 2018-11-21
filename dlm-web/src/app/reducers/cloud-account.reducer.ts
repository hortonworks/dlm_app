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

import * as fromCloudAccount from 'actions/cloud-account.action';
import { WasbAccount } from 'models/wasb-account.model';
import { AwsAccount } from 'models/aws-account.model';
import { groupByKey } from 'utils/array-util';
import { AdlsAccount } from 'models/adls-account.model';
import { Progress, HttpProgress, CloudAccountStatus, CloudAccountsStatusResponse } from 'models/cloud-account.model';
import { PROGRESS_STATUS } from 'constants/status.constant';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export interface State {
  WASB: EntityState<WasbAccount>;
  AWS: EntityState<AwsAccount>;
  ADLS: EntityState<AdlsAccount>;
  status: EntityState<CloudAccountStatus>;
  progress?: Progress;
}

export interface CloudAccountAdapters {
  WASB: EntityAdapter<WasbAccount>;
  AWS: EntityAdapter<AwsAccount>;
  ADLS: EntityAdapter<AdlsAccount>;
  status: EntityAdapter<CloudAccountStatus>;
}

export const cloudAccountAdapters = {
  WASB: createEntityAdapter<WasbAccount>(),
  AWS: createEntityAdapter<AwsAccount>(),
  ADLS: createEntityAdapter<AdlsAccount>(),
  status: createEntityAdapter<CloudAccountStatus>({
    selectId: clAccStatus => clAccStatus.name
  })
};
export const initialState: State = {
  WASB: { ...cloudAccountAdapters.WASB.getInitialState({ entities: {} }) },
  AWS: { ...cloudAccountAdapters.AWS.getInitialState({ entities: {} }) },
  ADLS: { ...cloudAccountAdapters.ADLS.getInitialState({ entities: {} }) },
  status: { ...cloudAccountAdapters.status.getInitialState({ entities: {} }) },
  progress: <Progress>{
    addCloudStore: <HttpProgress> {
      state: PROGRESS_STATUS.INIT,
      response: {}
    },
    validateCredentials: <HttpProgress> {
      state: PROGRESS_STATUS.INIT,
      response: {}
    }
  }
};

export function reducer(state: State = initialState, action): State {
  switch (action.type) {
    case fromCloudAccount.ActionTypes.LOAD_ACCOUNTS.SUCCESS: {
      const accounts = action.payload.response.accounts;
      const accountsMap: any = groupByKey(accounts, 'accountDetails.provider');
      return {
        ...state,
        WASB: { ...cloudAccountAdapters.WASB.upsertMany(accountsMap.WASB || [], state.WASB) },
        AWS: { ...cloudAccountAdapters.AWS.upsertMany(accountsMap.AWS || [], state.AWS) },
        ADLS: { ...cloudAccountAdapters.ADLS.upsertMany(accountsMap.ADLS || [], state.ADLS) }
      };
    }
    case fromCloudAccount.ActionTypes.VALIDATE_CREDENTIALS.SUCCESS: {
      return <State> {
        ...state,
        progress: {
          addCloudStore: Object.assign({}, initialState.progress.addCloudStore),
          validateCredentials: {
            state: PROGRESS_STATUS.SUCCESS,
            response: action.payload.response
          }
        }
      };
    }
    case fromCloudAccount.ActionTypes.VALIDATE_CREDENTIALS.FAILURE: {
      return <State> {
        ...state,
        progress: {
          addCloudStore: Object.assign({}, initialState.progress.addCloudStore),
          validateCredentials: {
            state: PROGRESS_STATUS.FAILED,
            response: action.payload
          }
        }
      };
    }
    case fromCloudAccount.ActionTypes.RESET_ADD_CLOUD_PROGRESS_STATE: {
      return <State> {
        ...state,
        progress: {
          addCloudStore: Object.assign({}, initialState.progress.addCloudStore),
          validateCredentials: Object.assign({}, initialState.progress.validateCredentials)
        }
      };
    }
    case fromCloudAccount.ActionTypes.ADD_CLOUD_STORE.SUCCESS: {
      const response = action.payload.response;
      if (response) {
        return <State> {
          ...state,
          progress: {
            ...state.progress,
            addCloudStore: {
              state: PROGRESS_STATUS.SUCCESS,
              response
            }
          }
        };
      }
      return <State> {
        ...state,
        progress: {
          validateCredentials: Object.assign({}, initialState.progress.validateCredentials),
          addCloudStore: {
            state: PROGRESS_STATUS.FAILED,
            response: {
              error: {
                error: {
                  message: 'Unexpected response'
                }
              }
            }
          }
        }
      };
    }
    case fromCloudAccount.ActionTypes.ADD_CLOUD_STORE.FAILURE: {
      return <State> {
        ...state,
        progress: {
          validateCredentials: Object.assign({}, initialState.progress.validateCredentials),
          addCloudStore: {
            state: PROGRESS_STATUS.FAILED,
            response: action.payload
          }
        }
      };
    }
    case fromCloudAccount.ActionTypes.LOAD_ACCOUNTS_STATUS.SUCCESS: {
      const statuses: CloudAccountsStatusResponse = action.payload.response;
      return {
        ...state,
        status: { ...cloudAccountAdapters.status.upsertMany(statuses, state.status) }
      };
    }
    case fromCloudAccount.ActionTypes.DELETE_CLOUD_STORE.SUCCESS: {
      if (!action.payload.response) {
        return state;
      }
      const { id, accountDetails: {provider} } = action.payload.response;
      return {
        ...state,
        [provider]: {
          ...cloudAccountAdapters[provider].removeOne(id, state[provider])
        }
      };
    }
    default: {
      return state;
    }
  }
}
