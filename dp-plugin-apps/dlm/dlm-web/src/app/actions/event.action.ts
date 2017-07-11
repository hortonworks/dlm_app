import { type } from '../utils/type-action';
import { Action } from '@ngrx/store';

export const ActionTypes = {
  LOAD_EVENTS: type('LOAD_EVENTS'),
  LOAD_EVENTS_SUCCESS: type('LOAD_EVENTS_SUCCESS'),
  LOAD_EVENTS_FAIL: type('LOAD_EVENTS_FAIL'),
  LOAD_NEW_EVENTS_COUNT: type('LOAD_NEW_EVENTS_COUNT'),
  LOAD_NEW_EVENTS_COUNT_SUCCESS: type('LOAD_NEW_EVENTS_COUNT_SUCCESS'),
  LOAD_NEW_EVENTS_COUNT_FAIL: type('LOAD_NEW_EVENTS_COUNT_FAIL')
};

export const loadEvents = (requestId?: string): Action => ({
  type: ActionTypes.LOAD_EVENTS,
  payload: {
    meta: {requestId}
  }
});

export const loadEventsSuccess = (events): Action => ({type: ActionTypes.LOAD_EVENTS_SUCCESS, payload: events});

export const loadEventsFail = (error): Action => ({type: ActionTypes.LOAD_EVENTS_FAIL});

export const loadNewEventsCount = (): Action => ({type: ActionTypes.LOAD_NEW_EVENTS_COUNT});

export const loadNewEventsCountSuccess = (events): Action => ({type: ActionTypes.LOAD_NEW_EVENTS_COUNT_SUCCESS, payload: events});

export const loadNewEventsCountFail = (error): Action => ({type: ActionTypes.LOAD_NEW_EVENTS_COUNT_FAIL});
