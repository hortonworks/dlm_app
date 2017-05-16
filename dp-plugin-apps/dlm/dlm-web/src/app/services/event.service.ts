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
