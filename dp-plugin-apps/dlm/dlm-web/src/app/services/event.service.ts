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

@Injectable()
export class EventService {

  constructor(private http: Http) { }

  getEvents(): Observable<any> {
    // Beacon API requires start time to give the correct response.
    // Temporarily adding start time to events
    return this.http.get('events?start=2017-01-01T00:00:00').map(r => r.json());
  }

  getNewEvents(): Observable<any> {
    // todo: Change the url to "events" with query parameter "start_time"
    return this.http.get('events').map(r => r.json());
  }
}
