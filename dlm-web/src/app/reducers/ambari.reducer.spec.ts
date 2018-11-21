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

import { reducer } from './ambari.reducer';
import * as fromAmbari from 'actions/ambari.action';

describe('ambari reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual({ privileges: { ids: [], entities: {} } });
  });

  it('should add loaded ambari privileges to store', () => {
    const action = {
      type: fromAmbari.ActionTypes.LOAD_AMBARI_PRIVILEGES.SUCCESS,
      payload: {
        response: [
          {
            clusterId: 1,
            isConfigReadAuthEnabled: true
          },
          {
            clusterId: 2,
            isConfigReadAuthEnabled: true
          },
          {
            clusterId: 3,
            isConfigReadAuthEnabled: true
          }
        ]
      }
    };
    const result = reducer({ privileges: { ids: [], entities: {} } }, action);

    expect(result).toEqual({
      privileges: {
        ids: [1, 2, 3],
        entities: {
          '1': {
            clusterId: 1,
            isConfigReadAuthEnabled: true
          },
          '2': {
            clusterId: 2,
            isConfigReadAuthEnabled: true
          },
          '3': {
            clusterId: 3,
            isConfigReadAuthEnabled: true
          }
        }
      }
    });
  });

  it('should replace loaded ambari privileges in store', () => {
    const action = {
      type: fromAmbari.ActionTypes.LOAD_AMBARI_PRIVILEGES.SUCCESS,
      payload: {
        response: [
          {
            clusterId: 3,
            isConfigReadAuthEnabled: true
          }
        ]
      }
    };
    const result = reducer({ privileges: {
      ids: [1, 2],
      entities: {
      '1': {
        clusterId: 1,
        isConfigReadAuthEnabled: true
      },
      '2': {
        clusterId: 2,
        isConfigReadAuthEnabled: true
      },
    } } }, action);

    expect(result).toEqual({
      privileges: {
        ids: [3],
        entities: {
          '3': {
            clusterId: 3,
            isConfigReadAuthEnabled: true
          }
        }
      }
    });
  });
});
