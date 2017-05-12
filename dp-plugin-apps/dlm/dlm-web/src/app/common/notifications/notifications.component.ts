import { Component, Input, ElementRef, OnInit, SimpleChange, OnChanges } from '@angular/core';

import { Event } from 'models/event.model';

@Component({
  selector: 'notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent implements OnInit, OnChanges {

  @Input() events: Event[];
  @Input() newEventsCount: number;

  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    // todo: Remove this sorting during integration
    // Sort events by time
    if (changes['events']) {
      this.events.sort( (a, b) => { return (a.timestamp > b.timestamp) ? -1 : ( (b.timestamp > a.timestamp) ? 1 : 0); } );
    }
  }
}
