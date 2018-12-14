/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
