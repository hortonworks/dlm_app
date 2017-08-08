/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Event } from 'models/event.model';
import { EVENT_TYPE } from 'constants/event.constant';
import { getEventEntityName } from 'utils/event-utils';

@Component({
  selector: 'dlm-issues-list-item',
  template: `
    <div class="issue-list-item-container">
      <div class="issue-status">
        <dlm-event-status [event]="event"></dlm-event-status>
      </div>
      <div class="issue-info">
        <div class="name">
          <strong>{{ event.event }}</strong>
        </div>
        <div class="description">
          <span>{{ event.message }}</span>
          <span *ngIf="shouldShowLogsLink">
            <span>{{'common.for' | translate}}</span>
            <span class="actionable text-primary">
              <span (click)="selectPolicy.emit(event)">{{policyName}}</span>
              <i class="fa fa-file-text-o"
                (click)="selectLog.emit(event)"
                [tooltip]="'page.notifications.view_log' | translate">
              </i>
            </span>
          </span>
        </div>
        <div class="text-right text-muted timestamp">
          <small>
            {{ event.timestamp | fmtTz | amTimeAgo }}
          </small>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./issues-list-item.component.scss']
})
export class IssuesListItemComponent implements OnInit {
  get shouldShowLogsLink(): boolean {
    return Boolean(EVENT_TYPE[this.event.eventType]);
  }

  get policyName(): string {
    return getEventEntityName(this.event);
  }

  @Output() selectLog = new EventEmitter<Event>();
  @Output() selectPolicy = new EventEmitter<Event>();
  @Input() event: Event;

  constructor() { }

  ngOnInit() {
  }
}
