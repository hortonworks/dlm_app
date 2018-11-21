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

import { reducer, initialState } from './event.reducer';
import * as fromEvent from '../actions/event.action';

describe('event reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual(initialState);
  });

  it('should load events and add events to store', () => {
    const action = {
      type: fromEvent.ActionTypes.LOAD_EVENTS.SUCCESS,
      payload: {
        response: {
          events: [
            {
              id: 1
            },
            {
              id: 2
            },
            {
              id: 3
            },
            {
              id: 4
            }
          ]
        }
      }
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual(<any>{
      entities: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 }
      ],
      headId: 1,
      tailId: 4
    });
  });

  it('should load events and merge events to store', () => {
    const action = {
      type: fromEvent.ActionTypes.LOAD_EVENTS.SUCCESS,
      payload: {
        response: {
          events: [
            {
              id: 1
            },
            {
              id: 4
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      entities: [
        { id: 2 },
        { id: 3 }
      ],
      headId: 2,
      tailId: 3
    }, action);

    expect(result).toEqual(<any>{
      entities: [
        { id: 4 },
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ],
      headId: 4,
      tailId: 1
    });
  });

  it('should not load events and return initial state', () => {
    const action = {
      type: fromEvent.ActionTypes.LOAD_EVENTS.FAILURE,
      payload: null
    };

    const result = reducer({ ...initialState }, action);

    expect(result).toEqual({ ...initialState });
  });

});
