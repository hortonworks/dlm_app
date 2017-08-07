/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, OnInit, SimpleChange, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Event } from 'models/event.model';

@Component({
  selector: 'dlm-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent implements OnInit, OnChanges {

  @Input() events: Event[];
  @Input() newEventsCount: number;

  constructor(private router: Router) {
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

  viewAllClickHandler() {
    this.router.navigate(['/notifications']);
  }
}
