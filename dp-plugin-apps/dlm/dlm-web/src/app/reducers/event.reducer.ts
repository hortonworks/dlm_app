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
