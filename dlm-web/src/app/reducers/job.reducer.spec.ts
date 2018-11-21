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

import { reducer } from './job.reducer';
import * as fromJob from 'actions/job.action';
import * as fromPolicy from 'actions/policy.action';
import { initialState } from './job.reducer';
import { JOB_STATUS } from 'constants/status.constant';

describe('job reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual({ ...initialState });
  });

  it('should add loaded jobs to store', () => {
    const action = {
      type: fromJob.ActionTypes.LOAD_JOBS.SUCCESS,
      payload: {
        response: {
          jobs: [
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

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
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

  it('should merge loaded jobs to store', () => {
    const action = {
      type: fromJob.ActionTypes.LOAD_JOBS.SUCCESS,
      payload: {
        response: {
          jobs: [
            {
              id: '1'
            },
            {
              id: '2'
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      ...initialState,
      ids: ['3'],
      entities: {
        '3': {
          id: '3'
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      ids: ['3', '1', '2'],
      entities: {
        '3': {
          id: '3'
        },
        '1': {
          id: '1'
        },
        '2': {
          id: '2'
        }
      }
    });
  });

  it('should add loaded last jobs to store', () => {
    const action = {
      type: fromPolicy.ActionTypes.LOAD_LAST_JOBS.SUCCESS,
      payload: {
        response: {
          jobs: [
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

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
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

  it('should merge loaded last jobs to store', () => {
    const action = {
      type: fromJob.ActionTypes.LOAD_JOBS.SUCCESS,
      payload: {
        response: {
          jobs: [
            {
              id: '1'
            },
            {
              id: '2'
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      ...initialState,
      ids: ['3'],
      entities: {
        '3': {
          id: '3'
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      ids: ['3', '1', '2'],
      entities: {
        '3': {
          id: '3'
        },
        '1': {
          id: '1'
        },
        '2': {
          id: '2'
        }
      }
    });
  });

  it('should do nothing if job does not exist in store', () => {
    const action = {
      type: fromPolicy.ActionTypes.LOAD_POLICIES.SUCCESS,
      payload: {
        response: {
          policies: [
            {
              id: 'pol1',
              jobs: [
                {
                  id: '1',
                  status: JOB_STATUS.FAILED
                },
                {
                  id: '2',
                  status: JOB_STATUS.KILLED
                }
              ]
            },
            {
              id: 'pol2',
              jobs: [
                {
                  id: '3',
                  status: JOB_STATUS.RUNNING
                },
                {
                  id: '4',
                  status: JOB_STATUS.SKIPPED
                }
              ]
            },
            {
              id: 'pol3',
              jobs: [
                {
                  id: '5',
                  status: JOB_STATUS.SUCCESS
                },
                {
                  id: '6',
                  status: JOB_STATUS.WARNINGS
                }
              ]
            }
          ]
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual({ ...initialState });
  });

  it('should update job if it exists in store', () => {
    const action = {
      type: fromPolicy.ActionTypes.LOAD_POLICIES.SUCCESS,
      payload: {
        response: {
          policies: [
            {
              id: 'pol1',
              jobs: [
                {
                  id: '1',
                  status: JOB_STATUS.FAILED
                },
                {
                  id: '2',
                  status: JOB_STATUS.KILLED
                }
              ]
            },
            {
              id: 'pol2',
              jobs: [
                {
                  id: '3',
                  status: JOB_STATUS.RUNNING
                },
                {
                  id: '4',
                  status: JOB_STATUS.SKIPPED
                }
              ]
            },
            {
              id: 'pol3',
              jobs: [
                {
                  id: '5',
                  status: JOB_STATUS.SUCCESS
                },
                {
                  id: '6',
                  status: JOB_STATUS.WARNINGS
                }
              ]
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      ...initialState,
      ids: ['1'],
      entities: {
        '1': {
          id: '1',
          status: JOB_STATUS.RUNNING
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      ids: ['1'],
      entities: {
        '1': {
          id: '1',
          status: JOB_STATUS.FAILED
        }
      }
    });
  });

  it('should add loaded job page for policy to store', () => {
    const action = {
      type: fromJob.ActionTypes.LOAD_JOBS_PAGE_FOR_POLICY.SUCCESS,
      payload: {
        response: {
          jobs: [
            {
              id: '1'
            },
            {
              id: '2'
            },
            {
              id: '3'
            }
          ],
          totalResults: 3
        },
        meta: {
          pageSize: 5,
          offset: 10,
          policyId: 'pol1'
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
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
      },
      queries: {
        overallRecords: 3,
        lastResultIds: ['1', '2', '3'],
        pageSize: 5,
        offset: 10,
        policyId: 'pol1'
      }
    });
  });

  it('should merge loaded job page for policy to store', () => {
    const action = {
      type: fromJob.ActionTypes.LOAD_JOBS_PAGE_FOR_POLICY.SUCCESS,
      payload: {
        response: {
          jobs: [
            {
              id: '1'
            },
            {
              id: '2'
            }
          ],
          totalResults: 3
        },
        meta: {
          pageSize: 5,
          offset: 10,
          policyId: 'pol1'
        }
      }
    };

    const result = reducer(<any>{
      ...initialState,
      ids: ['3'],
      entities: {
        '3': {
          id: '3'
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      ids: ['3', '1', '2'],
      entities: {
        '3': {
          id: '3'
        },
        '1': {
          id: '1'
        },
        '2': {
          id: '2'
        }
      },
      queries: {
        overallRecords: 3,
        lastResultIds: ['1', '2'],
        pageSize: 5,
        offset: 10,
        policyId: 'pol1'
      }
    });
  });

});
