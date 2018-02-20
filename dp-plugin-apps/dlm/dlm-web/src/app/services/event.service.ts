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
import { HttpClient } from '@angular/common/http';
import { Event } from 'models/event.model';
import { toSearchParams } from 'utils/http-util';
import { getTime } from 'utils/date-util';

@Injectable()
export class EventService {

  decorateEvent(event: Event): Event {
    return {
      ...event,
      id: getTime(event.timestamp)
    };
  }

  constructor(private httpClient: HttpClient) { }

  getEvents(queryParams = {}): Observable<any> {
    // Beacon API requires start time to give the correct response.
    // Temporarily adding start time to events
    const params = toSearchParams(queryParams);
    return this.httpClient.get<any>('events', { params })
      .map(response => ({...response, events: response.events.map(this.decorateEvent)}));
  }

  getNewEvents(): Observable<any> {
    // todo: Change the url to "events" with query parameter "start_time"
    return this.httpClient.get<any>('events');
  }
}
