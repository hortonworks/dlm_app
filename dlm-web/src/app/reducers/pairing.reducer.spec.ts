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

import { reducer, initialState } from './pairing.reducer';
import * as fromPairing from '../actions/pairing.action';
import { PROGRESS_STATUS } from 'constants/status.constant';

describe('pairing reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual({ ...initialState });
  });

  it('should add loaded pairings in store', () => {
    const action = {
      type: fromPairing.ActionTypes.LOAD_PAIRINGS.SUCCESS,
      payload: {
        response: {
          pairedClusters: [
            {
              cluster1: { id: '1' },
              cluster2: { id: '2' }
            },
            {
              cluster1: { id: '3' },
              cluster2: { id: '4' }
            }
          ]
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      ids: ['1-2', '3-4'],
      entities: {
        '1-2': {
          cluster1: { id: '1' },
          cluster2: { id: '2' }
        },
        '3-4': {
          cluster1: { id: '3' },
          cluster2: { id: '4' }
        }
      }
    });
  });

  it('should merge loaded pairings in store', () => {
    const action = {
      type: fromPairing.ActionTypes.LOAD_PAIRINGS.SUCCESS,
      payload: {
        response: {
          pairedClusters: [
            {
              cluster1: { id: '3' },
              cluster2: { id: '4' }
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      ...initialState,
      ids: ['1-2'],
      entities: {
        '1-2': {
          cluster1: { id: '1' },
          cluster2: { id: '2' }
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      ids: ['1-2', '3-4'],
      entities: {
        '1-2': {
          cluster1: { id: '1' },
          cluster2: { id: '2' }
        },
        '3-4': {
          cluster1: { id: '3' },
          cluster2: { id: '4' }
        }
      }
    });
  });

  it('should change progress status in state when create pairing', () => {
    const action = {
      type: fromPairing.ActionTypes.CREATE_PAIRING.SUCCESS
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      progress: {
        ...initialState.progress,
        state: PROGRESS_STATUS.SUCCESS
      }
    });
  });

  it('should delete pairing from store', () => {
    const action = {
      type: fromPairing.ActionTypes.DELETE_PAIRING.SUCCESS,
      payload: {
        response: {
          payload: [
            {
              clusterId: '1'
            },
            {
              clusterId: '2'
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      ...initialState,
      entities: {
        '1-2': {},
        '3-4': {}
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      entities: {
        '3-4': {}
      }
    });
  });

  it('should change progress status in state when cannot create pairing', () => {
    const action = {
      type: fromPairing.ActionTypes.CREATE_PAIRING.FAILURE,
      payload: {
        error: {
          message: 'error'
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      progress: {
        ...initialState.progress,
        state: PROGRESS_STATUS.FAILED,
        response: {
          message: 'error'
        }
      }
    });
  });

  it('should return initial state when cannot load pairings', () => {
    const action = {
      type: fromPairing.ActionTypes.LOAD_PAIRINGS.FAILURE
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual({ ...initialState });
  });

  it('should return initial state when cannot delete pairings', () => {
    const action = {
      type: fromPairing.ActionTypes.DELETE_PAIRING.FAILURE
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual({ ...initialState });
  });

});
