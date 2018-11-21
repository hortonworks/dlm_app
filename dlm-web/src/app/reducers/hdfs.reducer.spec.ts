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

import { reducer, initialState } from './hdfs.reducer';
import * as fromHdfs from 'actions/hdfslist.action';

describe('hdfs reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual(initialState);
  });

  it('should add list status entities to store', () => {
    const action = {
      type: fromHdfs.ActionTypes.LIST_FILES.SUCCESS,
      payload: {
        response: {
          fileList: [
            {
              pathSuffix: 'path1'
            },
            {
              pathSuffix: 'path2'
            },
            {
              pathSuffix: 'path3'
            }
          ]
        },
        meta: {
          clusterId: 'cluster1',
          path: 'files_list1'
        },
      }
    };

    const result = reducer(initialState, action);

    expect(result).toEqual(<any>{
      entities: {
        cluster1: {
          files_list1: {
            path1: {
              pathSuffix: 'path1',
              parentFullPath: 'files_list1'
            },
            path2: {
              pathSuffix: 'path2',
              parentFullPath: 'files_list1'
            },
            path3: {
              pathSuffix: 'path3',
              parentFullPath: 'files_list1'
            }
          }
        }
      },
      lastRequestMeta: {
        fileList: [
          {
            pathSuffix: 'path1'
          },
          {
            pathSuffix: 'path2'
          },
          {
            pathSuffix: 'path3'
          }
        ]
      }
    });
  });

  it('should replace list status entities to store', () => {
    const action = {
      type: fromHdfs.ActionTypes.LIST_FILES.SUCCESS,
      payload: {
        response: {
          fileList: [
            {
              pathSuffix: 'path2'
            }
          ]
        },
        meta: {
          clusterId: 'cluster1',
          path: 'files_list1'
        },
      }
    };

    const result = reducer(<any>{
      entities: {
        cluster1: {
          files_list1: {
            path1: {
              pathSuffix: 'path1'
            },
            path3: {
              pathSuffix: 'path3'
            }
          }
        }
      },
      lastRequestMeta: {}
    }, action);

    expect(result).toEqual(<any>{
      entities: {
        cluster1: {
          files_list1: {
            path2: {
              pathSuffix: 'path2',
              parentFullPath: 'files_list1'
            }
          }
        }
      },
      lastRequestMeta: {
        fileList: [
          {
            pathSuffix: 'path2'
          }
        ]
      }
    });
  });

});
