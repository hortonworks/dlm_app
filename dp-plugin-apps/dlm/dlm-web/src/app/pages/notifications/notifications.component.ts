import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Event } from 'models/event.model';
import { getAllDisplayedEvents } from 'selectors/event.selector';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { loadEvents } from 'actions/event.action';

@Component({
  selector: 'dlm-notifications-page',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})

export class NotificationsPageComponent {

  events$: Observable<Event[]>;

  constructor(private store: Store<State>) {
    this.events$ = store.select(getAllDisplayedEvents);
    this.store.dispatch(loadEvents());
  }

}
