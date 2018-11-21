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

import { reducer } from './policy.reducer';
import * as fromPolicy from 'actions/policy.action';
import { POLICY_STATUS } from 'constants/status.constant';

describe('policy reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual({ ids: [], entities: {} });
  });

  it('should add policies to store', () => {
    const action = {
      type: fromPolicy.ActionTypes.LOAD_POLICIES.SUCCESS,
      payload: {
        response: {
          policies: [
            {
              id: '1'
            },
            {
              id: '2'
            },
            {
              id: '3'
            }
          ]
        }
      }
    };

    const result = reducer({ ids: [], entities: {} }, action);

    expect(result).toEqual(<any>{
      ids: ['1', '2', '3'],
      entities: {
        '1': {
          id: '1'
        },
        '2': {
          id: '2'
        },
        '3': {
          id: '3'
        }
      }
    });
  });

  it('should replace policies to store', () => {
    const action = {
      type: fromPolicy.ActionTypes.LOAD_POLICIES.SUCCESS,
      payload: {
        response: {
          policies: [
            {
              id: '3'
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      ids: ['1', '2'],
      entities: {
        '1': {
          id: '1'
        },
        '2': {
          id: '2'
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ids: ['3'],
      entities: {
        '3': {
          id: '3'
        }
      }
    });
  });

  it('should update policy in store', () => {
    const action = {
      type: fromPolicy.ActionTypes.UPDATE_POLICY.SUCCESS,
      payload: {
        response: {
          policy: {
            id: '1'
          },
          updatePayload: {
            description: 'pol_desc2',
            startTime: '333T333',
            endTime: '444T444',
            frequencyInSec: 5,
            cloudCred: 'cloud_cred2',
            queueName: 'queue_name2'
          }
        }
      }
    };

    const result = reducer(<any>{
      ids: ['1'],
      entities: {
        '1': {
          id: '1',
          description: 'pol_desc1',
          startTime: '111T111',
          endTime: '222T222',
          frequency: 3,
          customProperties: {
            cloudCred: 'cloud_cred1',
            queueName: 'queue_name1'
          }
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ids: ['1'],
      entities: {
        '1': {
          id: '1',
          description: 'pol_desc2',
          startTime: '333T333',
          endTime: '444T444',
          frequency: 5,
          customProperties: {
            cloudCred: 'cloud_cred2',
            queueName: 'queue_name2'
          }
        }
      }
    });
  });

  it('should remove policy from store', () => {
    const action = {
      type: fromPolicy.ActionTypes.DELETE_POLICY.SUCCESS,
      payload: {
        response: '1'
      }
    };

    const result = reducer(<any>{
      ids: ['1', '2', '3'],
      entities: {
        '1': {
          id: '1'
        },
        '2': {
          id: '2'
        },
        '3': {
          id: '3'
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ids: ['2', '3'],
      entities: {
        '2': {
          id: '2'
        },
        '3': {
          id: '3'
        }
      }
    });
  });

  it('should change policy status to suspended in store', () => {
    const action = {
      type: fromPolicy.ActionTypes.SUSPEND_POLICY.SUCCESS,
      payload: {
        response: '1'
      }
    };

    const result = reducer(<any>{
      ids: ['1'],
      entities: {
        '1': {
          id: '1',
          status: POLICY_STATUS.RUNNING
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ids: ['1'],
      entities: {
        '1': {
          id: '1',
          status: POLICY_STATUS.SUSPENDED
        }
      }
    });
  });

  it('should change policy status to running in store', () => {
    const action = {
      type: fromPolicy.ActionTypes.RESUME_POLICY.SUCCESS,
      payload: {
        response: '1'
      }
    };

    const result = reducer(<any>{
      ids: ['1'],
      entities: {
        '1': {
          id: '1',
          status: POLICY_STATUS.SUSPENDED
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ids: ['1'],
      entities: {
        '1': {
          id: '1',
          status: POLICY_STATUS.RUNNING
        }
      }
    });
  });

  it('should update policies in store', () => {
    const action = {
      type: fromPolicy.ActionTypes.LOAD_LAST_JOBS.SUCCESS,
      payload: {
        response: {
          jobs: [
            {
              id: '3',
              policyId: 'pol3',
              startTime: '3'
            },
            {
              id: '2',
              policyId: 'pol2',
              startTime: '2'
            },
            {
              id: '1',
              policyId: 'pol1',
              startTime: '1'
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      ids: ['pol1', 'pol2', 'pol3'],
      entities: {
        'pol1': {
          id: 'pol1',
          jobs: []
        },
        'pol2': {
          id: 'pol2',
          jobs: []
        },
        'pol3': {
          id: 'pol3',
          jobs: []
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ids: ['pol1', 'pol2', 'pol3'],
      entities: {
        'pol1': {
          id: 'pol1',
          jobs: [
            {
              id: '1',
              policyId: 'pol1',
              startTime: '1'
            }
          ]
        },
        'pol2': {
          id: 'pol2',
          jobs: [
            {
              id: '2',
              policyId: 'pol2',
              startTime: '2'
            }
          ]
        },
        'pol3': {
          id: 'pol3',
          jobs: [
            {
              id: '3',
              policyId: 'pol3',
              startTime: '3'
            }
          ]
        }
      }
    });
  });

});
