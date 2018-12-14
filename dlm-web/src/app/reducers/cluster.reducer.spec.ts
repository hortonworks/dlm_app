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

import { reducer } from './cluster.reducer';
import * as fromCluster from 'actions/cluster.action';
import { CLUSTER_STATUS } from 'constants/status.constant';

describe('cluster reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual({ ids: [], entities: {} });
  });

  it('should add loaded clusters to store', () => {
    const action = {
      type: fromCluster.ActionTypes.LOAD_CLUSTERS.SUCCESS,
      payload: {
        response: {
          clusters: [
            {
              id: 111
            },
            {
              id: 222,
              healthStatus: CLUSTER_STATUS.HEALTHY
            },
            {
              id: 333,
              status: [
                {
                  service_name: 'cluster3',
                  state: 'some_state'
                }
              ]
            }
          ]
        }
      }
    };

    const result = reducer({ ids: [], entities: {} }, action);

    expect(result).toEqual(<any>{
      ids: [111, 222, 333],
      entities: {
        '111': {
          id: 111,
          healthStatus: CLUSTER_STATUS.UNKNOWN,
          status: []
        },
        '222': {
          id: 222,
          healthStatus: CLUSTER_STATUS.UNKNOWN,
          status: []
        },
        '333': {
          id: 333,
          healthStatus: CLUSTER_STATUS.UNKNOWN,
          status: []
        }
      }
    });
  });

  it('should add and merge loaded clusters to store', () => {
    const action = {
      type: fromCluster.ActionTypes.LOAD_CLUSTERS.SUCCESS,
      payload: {
        response: {
          clusters: [
            {
              id: 111
            },
            {
              id: 222,
              healthStatus: CLUSTER_STATUS.HEALTHY
            },
            {
              id: 333,
              status: [
                {
                  service_name: 'cluster3',
                  state: 'some_state'
                }
              ]
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      ids: [111, 222],
      entities: {
        '111': {
          id: 111,
          healthStatus: CLUSTER_STATUS.HEALTHY,
          status: [
            {
              service_name: 'cluster1',
              state: 'some_state'
            }
          ]
        },
        '222': {
          id: 222,
          healthStatus: CLUSTER_STATUS.UNHEALTHY,
          status: [
            {
              service_name: 'cluster2',
              state: 'some_state'
            }
          ]
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ids: [111, 222, 333],
      entities: {
        '111': {
          id: 111,
          healthStatus: CLUSTER_STATUS.HEALTHY,
          status: [
            {
              service_name: 'cluster1',
              state: 'some_state'
            }
          ]
        },
        '222': {
          id: 222,
          healthStatus: CLUSTER_STATUS.UNHEALTHY,
          status: [
            {
              service_name: 'cluster2',
              state: 'some_state'
            }
          ]
        },
        '333': {
          id: 333,
          healthStatus: CLUSTER_STATUS.UNKNOWN,
          status: []
        }
      }
    });
  });

  it('should not add loaded cluster statuses', () => {
    const action = {
      type: fromCluster.ActionTypes.LOAD_CLUSTERS_STATUSES.SUCCESS,
      payload: {
        response: [
          {
            id: 111,
            data: {
              items: null
            }
          },
          {
            id: 222,
            data: {
              items: null
            }
          },
          {
            id: 333,
            data: {
              items: null
            }
          }
        ]
      }
    };

    const result = reducer({ ids: [], entities: {} }, action);

    expect(result).toEqual({ ids: [], entities: {} });
  });

  it('should update loaded cluster statuses', () => {
    const action = {
      type: fromCluster.ActionTypes.LOAD_CLUSTERS_STATUSES.SUCCESS,
      payload: {
        response: [
          {
            id: 111,
            data: {
              items: null
            }
          },
          {
            id: 222,
            data: {
              items: null
            }
          },
          {
            id: 333,
            data: {
              items: null
            }
          }
        ]
      }
    };

    const result = reducer(<any>{
      ids: [111, 222, 333],
      entities: {
        '111': {
          id: 111,
          status: [],
          healthStatus: CLUSTER_STATUS.HEALTHY
        },
        '222': {
          id: 222,
          status: [],
          healthStatus: CLUSTER_STATUS.UNHEALTHY
        },
        '333': {
          id: 333,
          status: [],
          healthStatus: CLUSTER_STATUS.WARNING
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ids: [111, 222, 333],
      entities: {
        '111': {
          id: 111,
          status: [],
          healthStatus: CLUSTER_STATUS.HEALTHY
        },
        '222': {
          id: 222,
          status: [],
          healthStatus: CLUSTER_STATUS.HEALTHY
        },
        '333': {
          id: 333,
          status: [],
          healthStatus: CLUSTER_STATUS.HEALTHY
        }
      }
    });
  });

  it('should return state on load clusters failure', () => {
    const action = {
      type: fromCluster.ActionTypes.LOAD_CLUSTERS.FAILURE
    };

    const result = reducer({ ids: [], entities: {} }, action);

    expect(result).toEqual({ ids: [], entities: {} });
  });

});
