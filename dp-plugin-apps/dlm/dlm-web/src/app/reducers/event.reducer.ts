/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Event } from '../models/event.model';
import { BaseState } from '../models/base-resource-state-array';
import * as fromEvent from '../actions/event.action';

export interface State extends BaseState<Event> {
  newEventsCount: number;
}

export const initialState: State = {
  entities: [],
  newEventsCount: 0
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromEvent.ActionTypes.LOAD_EVENTS.SUCCESS:
      return loadEventsSuccess(state, action);
    case fromEvent.ActionTypes.LOAD_NEW_EVENTS_COUNT.SUCCESS:
      return loadNewEventsCountSuccess(state, action);
    case fromEvent.ActionTypes.LOAD_EVENTS.FAILURE:
    case fromEvent.ActionTypes.LOAD_NEW_EVENTS_COUNT.FAILURE:
    default:
      return state;
  }
}

function loadEventsSuccess(state = initialState, action): State {
  const events = action.payload.response.events;
  return {
    entities: Object.assign([], state.entities, events),
    newEventsCount: state.newEventsCount
  };
}

function loadNewEventsCountSuccess(state = initialState, action): State {
  const count = action.payload.response.totalCount;
  return {
    entities: state.entities,
    newEventsCount: count
  };
}
