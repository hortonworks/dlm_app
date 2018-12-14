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

import { reducer } from './cloud-account.reducer';
import * as fromCloudAccount from 'actions/cloud-account.action';
import { initialState } from './cloud-account.reducer';
import { AccountStatus } from 'models/cloud-account.model';
import { PROGRESS_STATUS } from 'constants/status.constant';

describe('cloud account reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual({ ...initialState });
  });

  it('should add loaded accounts to store', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.LOAD_ACCOUNTS.SUCCESS,
      payload: {
        response: {
          accounts: [
            {
              id: 'cloudacc1',
              accountDetails: {
                accountName: '546328764597',
                credentialType: 'WASB',
                provider: 'WASB',
                userName: 'User'
              }
            },
            {
              id: 'cloudacc2',
              accountDetails: {
                accountName: '546328764597',
                credentialType: 'AWS_ACCESSKEY',
                provider: 'AWS',
                userName: 'User'
              }
            },
            {
              id: 'cloudacc3',
              accountDetails: {
                accountName: '546328764597',
                credentialType: 'ADLS_ACCESSKEY',
                provider: 'ADLS',
                userName: 'User'
              }
            }
          ]
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      WASB: {
        ids: ['cloudacc1'],
        entities: {
          cloudacc1: {
            id: 'cloudacc1',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'WASB',
              provider: 'WASB',
              userName: 'User'
            }
          }
        }
      },
      AWS: {
        ids: ['cloudacc2'],
        entities: {
          cloudacc2: {
            id: 'cloudacc2',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'AWS_ACCESSKEY',
              provider: 'AWS',
              userName: 'User'
            }
          }
        }
      },
      ADLS: {
        ids: ['cloudacc3'],
        entities: {
          cloudacc3: {
            id: 'cloudacc3',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'ADLS_ACCESSKEY',
              provider: 'ADLS',
              userName: 'User'
            }
          }
        }
      }
    });
  });

  it('should add and merge loaded accounts in store', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.LOAD_ACCOUNTS.SUCCESS,
      payload: {
        response: {
          accounts: [
            {
              id: 'cloudacc2',
              accountDetails: {
                accountName: '546328764597',
                credentialType: 'AWS_ACCESSKEY',
                provider: 'AWS',
                userName: 'User'
              }
            },
            {
              id: 'cloudacc3',
              accountDetails: {
                accountName: '546328764597',
                credentialType: 'ADLS_ACCESSKEY',
                provider: 'ADLS',
                userName: 'User'
              }
            },
            {
              id: 'cloudacc4',
              accountDetails: {
                accountName: '546328764597',
                credentialType: 'WASB',
                provider: 'WASB',
                userName: 'User'
              }
            }
          ]
        }
      }
    };

    const result = reducer({
      ...initialState,
      WASB: {
        ids: ['cloudacc1'],
        entities: {
          cloudacc1: {
            id: 'cloudacc1',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'WASB',
              provider: 'WASB',
              userName: 'User'
            }
          }
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      WASB: {
        ids: ['cloudacc1', 'cloudacc4'],
        entities: {
          cloudacc1: {
            id: 'cloudacc1',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'WASB',
              provider: 'WASB',
              userName: 'User'
            }
          },
          cloudacc4: {
            id: 'cloudacc4',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'WASB',
              provider: 'WASB',
              userName: 'User'
            }
          }
        }
      },
      AWS: {
        ids: ['cloudacc2'],
        entities: {
          cloudacc2: {
            id: 'cloudacc2',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'AWS_ACCESSKEY',
              provider: 'AWS',
              userName: 'User'
            }
          }
        }
      },
      ADLS: {
        ids: ['cloudacc3'],
        entities: {
          cloudacc3: {
            id: 'cloudacc3',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'ADLS_ACCESSKEY',
              provider: 'ADLS',
              userName: 'User'
            }
          }
        }
      }
    });
  });

  it('should validate credentials and add validation info in store', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.VALIDATE_CREDENTIALS.SUCCESS,
      payload: {
        response: {
          accountName: '123',
          credentialType: 'AWS_ACCESSKEY'
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual({
      ...initialState,
      progress: {
        addCloudStore: {
          state: PROGRESS_STATUS.INIT,
          response: {}
        },
        validateCredentials: {
          state: PROGRESS_STATUS.SUCCESS,
          response: {
            accountName: '123',
            credentialType: 'AWS_ACCESSKEY'
          }
        }
      }
    });
  });

  it('should not validate credentials and add an error to store', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.VALIDATE_CREDENTIALS.FAILURE,
      payload: {
        response: {
          error: 'is not valid'
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual({
      ...initialState,
      progress: {
        addCloudStore: {
          state: PROGRESS_STATUS.INIT,
          response: {}
        },
        validateCredentials: {
          state: PROGRESS_STATUS.FAILED,
          response: {
            response: {
              error: 'is not valid'
            }
          }
        }
      }
    });
  });

  it('should reset add cloud progress state', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.RESET_ADD_CLOUD_PROGRESS_STATE,
      payload: {
        response: null
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual({ ...initialState });
  });

  it('should not add cloud store in store when response is empty but status success', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.ADD_CLOUD_STORE.SUCCESS,
      payload: {
        response: null
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      progress: {
        addCloudStore: {
          state: PROGRESS_STATUS.FAILED,
          response: {
            error: {
              error: {
                message: 'Unexpected response'
              }
            }
          }
        },
        validateCredentials: { ...initialState.progress.validateCredentials }
      }
    });
  });

  it('should add cloud store in store', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.ADD_CLOUD_STORE.SUCCESS,
      payload: {
        response: {
          id: '123'
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      progress: {
        addCloudStore: {
          state: PROGRESS_STATUS.SUCCESS,
          response: {
            id: '123'
          }
        },
        validateCredentials: { ...initialState.progress.validateCredentials }
      }
    });
  });

  it('should not add cloud store in store', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.ADD_CLOUD_STORE.FAILURE,
      payload: {
        response: {
          error: {
            message: 'adding is failure'
          }
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      progress: {
        addCloudStore: {
          state: PROGRESS_STATUS.FAILED,
          response: {
            response: {
              error: {
                message: 'adding is failure'
              }
            }
          }
        },
        validateCredentials: { ...initialState.progress.validateCredentials }
      }
    });
  });

  it('should add loaded accounts statuses', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.LOAD_ACCOUNTS_STATUS.SUCCESS,
      payload: {
        response: [
          {
            name: 'dev-credentials',
            status: AccountStatus.Active
          },
          {
            name: 'dev-credentials-expired',
            status: AccountStatus.Expired
          }
        ]
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      status: {
        ids: ['dev-credentials', 'dev-credentials-expired'],
        entities: {
          'dev-credentials': {
            name: 'dev-credentials',
            status: AccountStatus.Active
          },
          'dev-credentials-expired': {
            name: 'dev-credentials-expired',
            status: AccountStatus.Expired
          }
        }
      }
    });
  });

  it('should add and merge loaded accounts statuses', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.LOAD_ACCOUNTS_STATUS.SUCCESS,
      payload: {
        response: [
          {
            name: 'dev-credentials-expired',
            status: AccountStatus.Expired
          },
          {
            name: 'dev-credentials2',
            status: AccountStatus.Active
          }
        ]
      }
    };

    const result = reducer({
      ...initialState,
      status: {
        ids: ['dev-credentials'],
        entities: {
          'dev-credentials': {
            name: 'dev-credentials',
            status: AccountStatus.Active
          }
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      status: {
        ids: ['dev-credentials', 'dev-credentials-expired', 'dev-credentials2'],
        entities: {
          'dev-credentials': {
            name: 'dev-credentials',
            status: AccountStatus.Active
          },
          'dev-credentials-expired': {
            name: 'dev-credentials-expired',
            status: AccountStatus.Expired
          },
          'dev-credentials2': {
            name: 'dev-credentials2',
            status: AccountStatus.Active
          }
        }
      }
    });
  });

  it('should not delete cloud store when response is empty but status success', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.DELETE_CLOUD_STORE.SUCCESS,
      payload: {
        response: null
      }
    };

    const result = reducer(initialState, action);

    expect(result).toEqual({ ...initialState });
  });

  it('should delete cloud store', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.DELETE_CLOUD_STORE.SUCCESS,
      payload: {
        response: {
          id: 'cloudacc1',
          accountDetails: {
            provider: 'WASB'
          }
        }
      }
    };

    const result = reducer(<any>{
      ...initialState,
      WASB: {
        ids: ['cloudacc1'],
        entities: {
          cloudacc1: {
            id: 'cloudacc1',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'WASB',
              provider: 'WASB',
              userName: 'User'
            }
          }
        }
      },
      AWS: {
        ids: ['cloudacc2'],
        entities: {
          cloudacc2: {
            id: 'cloudacc2',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'AWS_ACCESSKEY',
              provider: 'AWS',
              userName: 'User'
            }
          }
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      AWS: {
        ids: ['cloudacc2'],
        entities: {
          cloudacc2: {
            id: 'cloudacc2',
            accountDetails: {
              accountName: '546328764597',
              credentialType: 'AWS_ACCESSKEY',
              provider: 'AWS',
              userName: 'User'
            }
          }
        }
      }
    });
  });
});
