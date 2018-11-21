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

import { reducer } from './hive.reducer';
import { ActionTypes } from 'actions/hivelist.action';

describe('hive reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual({ entities: {} });
  });

  it('should add loaded databases to store', () => {
    const action = {
      type: ActionTypes.LOAD_DATABASES.SUCCESS,
      payload: {
        response: [
          {
            entityId: '1'
          },
          {
            entityId: '2'
          },
          {
            entityId: '3'
          }
        ]
      }
    };

    const result = reducer({ entities: {} }, action);

    expect(result).toEqual(<any>{
      entities: {
        '1': {
          entityId: '1'
        },
        '2': {
          entityId: '2'
        },
        '3': {
          entityId: '3'
        }
      }
    });
  });

  it('should merge loaded databases to store', () => {
    const action = {
      type: ActionTypes.LOAD_DATABASES.SUCCESS,
      payload: {
        response: [
          {
            entityId: '2'
          }
        ]
      }
    };

    const result = reducer(<any>{
      entities: {
        '1': {
          entityId: '1'
        },
        '3': {
          entityId: '3'
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      entities: {
        '1': {
          entityId: '1'
        },
        '2': {
          entityId: '2'
        },
        '3': {
          entityId: '3'
        }
      }
    });
  });

  it('should add loaded tables to store', () => {
    const action = {
      type: ActionTypes.LOAD_TABLES.SUCCESS,
      payload: {
        response: [
          {
            databaseEntityId: '1'
          },
          {
            databaseEntityId: '2'
          },
          {
            databaseEntityId: '3'
          }
        ]
      }
    };

    const result = reducer({ entities: {} }, action);

    expect(result).toEqual(<any>{
      entities: {
        '1': {
          tables: [
            {
              databaseEntityId: '1'
            },
            {
              databaseEntityId: '2'
            },
            {
              databaseEntityId: '3'
            }
          ]
        }
      }
    });
  });

  it('should replace loaded tables to store', () => {
    const action = {
      type: ActionTypes.LOAD_TABLES.SUCCESS,
      payload: {
        response: [
          {
            databaseEntityId: '1'
          },
          {
            databaseEntityId: '2'
          }
        ]
      }
    };

    const result = reducer(<any>{
      entities: {
        '1': {
          tables: [
            {
              databaseEntityId: '3'
            }
          ]
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      entities: {
        '1': {
          tables: [
            {
              databaseEntityId: '1'
            },
            {
              databaseEntityId: '2'
            }
          ]
        }
      }
    });
  });

});
