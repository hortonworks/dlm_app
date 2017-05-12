import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class EventService {

  constructor(private http: Http) { }

  getEvents(): Observable<any> {
    return this.http.get('events').map(r => r.json());
  }

  getNewEvents(): Observable<any> {
    // todo: Change the url to "events" with query parameter "start_time"
    return this.http.get('new_events').map(r => r.json());
  }
}
