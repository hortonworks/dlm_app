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

@Component({
  selector: 'dlm-issues-list-item',
  template: `
    <div class="issue-list-item-container">
      <div class="issue-status">
        <dlm-event-status [event]="event"></dlm-event-status>
      </div>
      <div class="issue-info">
        <div class="name first-letter-capitalize">
          <strong>{{ event.event }}</strong>
        </div>
        <div class="description first-letter-capitalize">
          <dlm-event-message [event]="event"></dlm-event-message>
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

  @Input() event: Event;

  constructor() { }

  ngOnInit() {
  }
}
