import { requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';

export const ActionTypes = {
  LOAD_EVENTS: requestType('LOAD_EVENTS'),
  LOAD_NEW_EVENTS_COUNT: requestType('LOAD_NEW_EVENTS_COUNT')
};

export const loadEvents = (): Action => ({type: ActionTypes.LOAD_EVENTS.START});

export const loadEventsSuccess = (events): Action => ({type: ActionTypes.LOAD_EVENTS.SUCCESS, payload: events});

export const loadEventsFail = (error): Action => ({type: ActionTypes.LOAD_EVENTS.FAILURE});

export const loadNewEventsCount = (): Action => ({type: ActionTypes.LOAD_NEW_EVENTS_COUNT.START});

export const loadNewEventsCountSuccess = (events): Action => ({type: ActionTypes.LOAD_NEW_EVENTS_COUNT.SUCCESS, payload: events});

export const loadNewEventsCountFail = (error): Action => ({type: ActionTypes.LOAD_NEW_EVENTS_COUNT.FAILURE});
