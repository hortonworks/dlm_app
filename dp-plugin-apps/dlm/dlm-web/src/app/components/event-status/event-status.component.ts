/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Event } from 'models/event.model';
import { EVENT_SEVERITY } from 'constants/status.constant';

@Component({
  selector: 'dlm-event-status',
  styleUrls: ['./event-status.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `<span [ngClass]="severityClassName()"></span>`
})
export class EventStatusComponent {
  @Input() event: Event;

  severityClassName() {
    const { INFO, CRITICAL, WARN, ERROR } = EVENT_SEVERITY;
    const circleClass = 'fa fa-circle';
    switch (this.event.severity) {
      case CRITICAL:
      case ERROR:
        return `${circleClass} text-danger`;
      case WARN:
        return `${circleClass} text-warning`;
      default:
        return `${circleClass} text-primary`;
    }
  }
}
