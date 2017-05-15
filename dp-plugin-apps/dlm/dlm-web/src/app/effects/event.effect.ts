import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { EventService } from '../services/event.service';

import {
  loadEventsSuccess, loadEventsFail, ActionTypes as eventActions, loadNewEventsCountSuccess, loadNewEventsCountFail
} from '../actions/event.action';

@Injectable()
export class EventEffects {

  @Effect()
  loadEvents$: Observable<any> = this.actions$
    .ofType(eventActions.LOAD_EVENTS)
    .switchMap(() => {
      return this.eventService.getEvents()
        .map(events => loadEventsSuccess(events))
        .catch(err => Observable.of(loadEventsFail(err)));
    });

  @Effect()
  loadNewEventsCount$: Observable<any> = this.actions$
    .ofType(eventActions.LOAD_NEW_EVENTS_COUNT)
    .switchMap(() => {
      return this.eventService.getNewEvents()
        .map(events => loadNewEventsCountSuccess(events))
        .catch(err => Observable.of(loadNewEventsCountFail(err)));
    });
  constructor(private actions$: Actions, private eventService: EventService) { }
}
