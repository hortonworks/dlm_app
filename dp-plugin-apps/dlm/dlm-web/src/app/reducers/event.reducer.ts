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
  headId: number;
  tailId: number;
}

export const initialState: State = {
  entities: [],
  newEventsCount: 0,
  headId: 0,
  tailId: 0
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
  if (!events.length) {
    return state;
  }
  if (state.headId === 0 && state.tailId === 0) {
    return {
      ...state,
      entities: events,
      headId: events[0].id,
      tailId: events[events.length - 1].id
    };
  }
  const { head, tail } = <{head: Event[], tail: Event[]}>events.reduce((all, event) => {
    if (event.id < state.tailId) {
      return {
        ...all,
        tail: all.tail.concat(event)
      };
    } else if (event.id > state.headId) {
      return {
        ...all,
        head: all.head.concat(event)
      };
    }
    return all;
  }, {head: [], tail: []});
  return {
    ...state,
    entities: [
      ...head,
      ...state.entities,
      ...tail
    ],
    headId: head.length && head[0].id || state.headId,
    tailId: tail.length && tail[tail.length - 1].id || state.tailId
  };
}

function loadNewEventsCountSuccess(state = initialState, action): State {
  const count = action.payload.response.totalCount;
  return {
    ...state,
    entities: state.entities,
    newEventsCount: count
  };
}
