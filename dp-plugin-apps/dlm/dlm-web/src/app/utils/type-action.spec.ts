/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
