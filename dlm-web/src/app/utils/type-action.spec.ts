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

import { requestType, createRequestAction } from 'utils/type-action';

describe('#Type Action Utils', () => {
  describe('#createRequestAction', () => {
    it('should bootstrap action', () => {
      const action = requestType('SOME_REQUEST');
      const { someRequest, someRequestSuccess, someRequestFailure } = createRequestAction(action);
      expect(someRequest('arg', { obj: 'a'})).toEqual({
        type: action.START,
        payload: {args: ['arg', { obj: 'a' }]}
      }, 'default start action pass arguments to args object');
      expect(someRequestSuccess({items: 'request response'}, {requestId: 'someId'})).toEqual({
        type: action.SUCCESS,
        payload: {
          response: {items: 'request response'},
          meta: {requestId: 'someId'}
        }
      }, 'default success action contains response and meta objects in payload');
      expect(someRequestFailure({ apiError: 'some error'})).toEqual({
        type: action.FAILURE,
        payload: {
          error: {apiError: 'some error'},
          meta: {}
        }
      }, 'default error action contains error and meta objects');
    });

    it('should bootstrap action with specified payload handlers', () => {
      const action = requestType('CUSTOM_REQUEST');
      const { customRequest, customRequestSuccess, customRequestFailure } = createRequestAction(action, {
        start: (entityId, params, meta) => ({
          entityId,
          params,
          meta
        }),
        success: (customEntity, response, meta) => ({
          customEntity,
          response,
          meta,
          customProperty: true
        }),
        failure: (err, details, meta) => ({
          err,
          details,
          meta
        })
      });
      expect(customRequest(1, { numResults: 200}, { requestId: 'someId'})).toEqual({
        type: action.START,
        payload: {entityId: 1, params: {numResults: 200}, meta: {requestId: 'someId'}}
      }, 'start action payload contains returned object from "start" handler');
      expect(customRequestSuccess({ someEntity: 'entity' }, { items: 'response' }, {})).toEqual({
        type: action.SUCCESS,
        payload: {
          customEntity: {someEntity: 'entity'},
          response: {items: 'response'},
          meta: {},
          customProperty: true
        }
      }, 'success action payload contains returned object from "success" handler');
      expect(customRequestFailure({ error: 'err'}, 'error details', { requestId: 'someId' })).toEqual({
        type: action.FAILURE,
        payload: {
          err: {error: 'err'},
          details: 'error details',
          meta: {requestId: 'someId'}
        }
      }, 'failure action payload contains returned object from "failure" handler');
    });
  });
});
