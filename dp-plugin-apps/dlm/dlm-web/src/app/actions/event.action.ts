import { requestType } from 'utils/type-action';
import { Action } from '@ngrx/store';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';

export const ActionTypes = {
  LOAD_EVENTS: requestType('LOAD_EVENTS'),
  LOAD_NEW_EVENTS_COUNT: requestType('LOAD_NEW_EVENTS_COUNT')
};

export const loadEvents = (meta = {}): Action => ({type: ActionTypes.LOAD_EVENTS.START, payload: { meta }});

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
