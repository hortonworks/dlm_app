import { Component, Input, OnInit } from '@angular/core';
import { Event } from 'models/event.model';

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
        <div class="description">{{ event.message }}</div>
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
