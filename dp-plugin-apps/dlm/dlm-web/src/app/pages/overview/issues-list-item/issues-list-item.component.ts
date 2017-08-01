import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Event } from 'models/event.model';
import { EVENT_TYPE } from 'constants/event.constant';
import { getEventEntityName } from 'utils/event-utils';

// todo: job messsage is missing
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
            <span class="actionable text-primary" (click)="selectEntity()">
              {{policyName}}
              <i class="fa fa-file-text-o"></i>
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

  @Output() selectEventEntity = new EventEmitter<Event>();
  @Input() event: Event;

  constructor() { }

  ngOnInit() {
  }

  selectEntity() {
    this.selectEventEntity.emit(this.event);
  }

}
