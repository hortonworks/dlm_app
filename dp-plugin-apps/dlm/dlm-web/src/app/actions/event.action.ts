/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { requestType } from 'utils/type-action';
import { Action } from '@ngrx/store';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_EVENTS: requestType('LOAD_EVENTS'),
  LOAD_NEW_EVENTS_COUNT: requestType('LOAD_NEW_EVENTS_COUNT')
};

export const loadEvents = (queryParams = {}, meta = {}): Action => ({
  type: ActionTypes.LOAD_EVENTS.START,
  payload: { queryParams, meta }
});

export const loadEventsSuccess = (events, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_EVENTS.SUCCESS,
  payload: { response: events, meta }
});

export const loadEventsFail = (error, meta = {}): ActionFailure => ({type: ActionTypes.LOAD_EVENTS.FAILURE, payload: { error, meta }});

export const loadNewEventsCount = (meta = {}): Action => ({type: ActionTypes.LOAD_NEW_EVENTS_COUNT.START, payload: { meta }});

export const loadNewEventsCountSuccess = (events, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_NEW_EVENTS_COUNT.SUCCESS,
  payload: { response: events, meta }
});

export const loadNewEventsCountFail = (error, meta = {}): ActionFailure => ({
  type: ActionTypes.LOAD_NEW_EVENTS_COUNT.FAILURE,
  payload: { error, meta}
});
