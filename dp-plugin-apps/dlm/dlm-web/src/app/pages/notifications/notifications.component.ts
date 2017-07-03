import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Event } from 'models/event.model';
import { Cluster } from 'models/cluster.model';
import { getAllDisplayedEvents } from 'selectors/event.selector';
import { getAllClusters } from 'selectors/cluster.selector';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { loadEvents } from 'actions/event.action';
import { loadClusters } from 'actions/cluster.action';

@Component({
  selector: 'dlm-notifications-page',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})

export class NotificationsPageComponent {

  events$: Observable<Event[]>;
  clusters$: Observable<Cluster[]>;

  constructor(private store: Store<State>) {
    this.events$ = store.select(getAllDisplayedEvents);
    this.clusters$ = store.select(getAllClusters);
    this.store.dispatch(loadEvents());
    this.store.dispatch(loadClusters());
  }

}
