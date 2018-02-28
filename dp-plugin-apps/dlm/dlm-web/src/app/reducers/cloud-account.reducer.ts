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
import { AdlsAccount } from 'models/adls-account.model';
import { Progress, HttpProgress, CloudAccountStatus, CloudAccountsStatusResponse } from 'models/cloud-account.model';
import { PROGRESS_STATUS } from 'constants/status.constant';

export interface State {
  WASB: BaseState<WasbAccount>;
  S3: BaseState<AwsAccount>;
  ADLS: BaseState<AdlsAccount>;
  status: BaseState<CloudAccountStatus>;
  progress?: Progress;
}

export const initialState: State = {
  WASB: {
    entities: {}
  },
  S3: {
    entities: {}
  },
  ADLS: {
    entities: {}
  },
  status: {
    entities: {}
  },
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
        WASB: {
          entities: Object.assign({}, state.WASB.entities, toEntities<WasbAccount>(accountsMap.WASB || []))
        },
        S3: {
          entities: Object.assign({}, state.S3.entities, toEntities<AwsAccount>(accountsMap.S3 || []))
        },
        ADLS: {
          entities: Object.assign({}, state.ADLS.entities, toEntities<AdlsAccount>(accountsMap.ADLS || []))
        }
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
        status: {
          entities: Object.assign({}, state.status.entities, toEntities<CloudAccountStatus>(statuses, 'name'))
        }
      };
    }
    default: {
      return state;
    }
  }
}
