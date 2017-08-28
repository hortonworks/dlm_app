/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Event } from 'models/event.model';
import { toSearchParams, mapResponse } from 'utils/http-util';
import { getTime } from 'utils/date-util';

@Injectable()
export class EventService {

  decorateEvent(event: Event): Event {
    return {
      ...event,
      id: getTime(event.timestamp)
    };
  }

  constructor(private http: Http) { }

  getEvents(queryParams = {}): Observable<any> {
    // Beacon API requires start time to give the correct response.
    // Temporarily adding start time to events
    const search = toSearchParams(queryParams);
    return mapResponse(this.http.get('events', { search: search }))
      .map(response => ({...response, events: response.events.map(this.decorateEvent)}));
  }

  getNewEvents(): Observable<any> {
    // todo: Change the url to "events" with query parameter "start_time"
    return this.http.get('events').map(r => r.json());
  }
}
