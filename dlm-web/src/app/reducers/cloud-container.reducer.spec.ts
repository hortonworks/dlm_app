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

import { reducer, initialState } from './cloud-container.reducer';
import * as fromCloudContainer from 'actions/cloud-container.action';

describe('cloud container reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual({ ...initialState });
  });

  it('should add loaded cloud containers to store', () => {
    const action = {
      type: fromCloudContainer.ActionTypes.LOAD_CONTAINERS.SUCCESS,
      payload: {
        response: [
          {
            name: 'cont1',
            accountId: '1',
            provider: 'WASB'
          },
          {
            name: 'cont2',
            accountId: '2',
            provider: 'AWS'
          },
          {
            name: 'cont3',
            accountId: '3',
            provider: 'ADLS'
          }
        ]
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      WASB: {
        ids: ['cont1_1'],
        entities: {
          cont1_1: {
            id: 'cont1_1',
            name: 'cont1',
            accountId: '1',
            provider: 'WASB'
          }
        }
      },
      AWS: {
        ids: ['cont2_2'],
        entities: {
          cont2_2: {
            id: 'cont2_2',
            name: 'cont2',
            accountId: '2',
            provider: 'AWS'
          }
        }
      },
      ADLS: {
        ids: ['cont3_3'],
        entities: {
          cont3_3: {
            id: 'cont3_3',
            name: 'cont3',
            accountId: '3',
            provider: 'ADLS'
          }
        }
      }
    });
  });

  it('should add and merge loaded cloud containers to store', () => {
    const action = {
      type: fromCloudContainer.ActionTypes.LOAD_CONTAINERS.SUCCESS,
      payload: {
        response: [
          {
            name: 'cont2',
            accountId: '2',
            provider: 'AWS'
          },
          {
            name: 'cont3',
            accountId: '3',
            provider: 'ADLS'
          },
          {
            name: 'cont4',
            accountId: '4',
            provider: 'WASB'
          }
        ]
      }
    };

    const result = reducer(<any>{
      ...initialState,
      WASB: {
        ids: ['cont1_1'],
        entities: {
          cont1_1: {
            id: 'cont1_1',
            name: 'cont1',
            accountId: '1',
            provider: 'WASB'
          }
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ...initialState,
      WASB: {
        ids: ['cont1_1', 'cont4_4'],
        entities: {
          cont1_1: {
            id: 'cont1_1',
            name: 'cont1',
            accountId: '1',
            provider: 'WASB'
          },
          cont4_4: {
            id: 'cont4_4',
            name: 'cont4',
            accountId: '4',
            provider: 'WASB'
          }
        }
      },
      AWS: {
        ids: ['cont2_2'],
        entities: {
          cont2_2: {
            id: 'cont2_2',
            name: 'cont2',
            accountId: '2',
            provider: 'AWS'
          }
        }
      },
      ADLS: {
        ids: ['cont3_3'],
        entities: {
          cont3_3: {
            id: 'cont3_3',
            name: 'cont3',
            accountId: '3',
            provider: 'ADLS'
          }
        }
      }
    });
  });

});
