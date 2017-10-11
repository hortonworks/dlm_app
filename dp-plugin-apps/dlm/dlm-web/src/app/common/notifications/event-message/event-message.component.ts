/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, ViewEncapsulation} from '@angular/core';
import { Router } from '@angular/router';
import { Event } from 'models/event.model';
import { getEventEntityName } from 'utils/event-utils';
import { EVENT_TYPE } from 'constants/event.constant';
import { LogService } from 'services/log.service';
import { EntityType, LOG_EVENT_TYPE_MAP } from 'constants/log.constant';
import { JOB_EVENT } from 'constants/event.constant';

@Component({
  selector: 'dlm-event-message',
  template: `
    <span>
      <span>{{ event.message }}</span>
      <span *ngIf="shouldShowLogsLink">
        <span>{{'common.for' | translate}}</span>
        <span>
          <dlm-event-entity-link [event]="event" (onClick)="goToPolicy($event)"></dlm-event-entity-link>
          <i class="fa fa-file-text-o actionable text-primary"
            (click)="showEventEntityLogs(event)"
            [tooltip]="'page.notifications.view_log' | translate">
          </i>
        </span>
      </span>
    </span>
  `,
  encapsulation: ViewEncapsulation.None,
})

export class EventMessageComponent {

  @Input() event: Event;

  get shouldShowLogsLink(): boolean {
    return Boolean(EVENT_TYPE[this.event.eventType]);
  }

  constructor(private router: Router, private logService: LogService) {
  }

  showEventEntityLogs(event: Event) {
    const entityType = JOB_EVENT === event.eventType ? EntityType.policyinstance : EntityType.policy;
    this.logService.showLog(entityType, event[LOG_EVENT_TYPE_MAP[entityType]], event.timestamp);
  }

  goToPolicy(event: Event) {
    this.router.navigate(['/policies'], {queryParams: {policy: getEventEntityName(event)}});
  }
}
