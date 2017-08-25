/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { EventService } from 'services/event.service';

import {
  loadEventsSuccess, loadEventsFail, ActionTypes as eventActions, loadNewEventsCountSuccess, loadNewEventsCountFail
} from 'actions/event.action';

@Injectable()
export class EventEffects {

  @Effect()
  loadEvents$: Observable<any> = this.actions$
    .ofType(eventActions.LOAD_EVENTS.START)
    .map(toPayload)
    .mergeMap(payload => {
      return this.eventService.getEvents(payload.queryParams)
        .map(events => loadEventsSuccess(events, payload.meta))
        .catch(err => Observable.of(loadEventsFail(err, payload.meta)));
    });

  @Effect()
  loadNewEventsCount$: Observable<any> = this.actions$
    .ofType(eventActions.LOAD_NEW_EVENTS_COUNT.START)
    .map(toPayload)
    .mergeMap(payload => {
      return this.eventService.getNewEvents()
        .map(events => loadNewEventsCountSuccess(events, payload.meta))
        .catch(err => Observable.of(loadNewEventsCountFail(err, payload.meta)));
    });

  constructor(private actions$: Actions, private eventService: EventService) { }
}
