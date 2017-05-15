import { Component, Input, OnInit } from '@angular/core';
import { Event } from 'models/event.model';

// todo: job messsage is missing
@Component({
  selector: 'dlm-issues-list-item',
  template: `
    <div class="issue-list-item-container">
      <div class="issue-status">
        <span [ngClass]="{'fa': true, 'fa-circle': true, 'alert-state-CRITICAL': event.eventStatus === 'critical', 
        'alert-state-WARNING': event.eventStatus === 'warning'}">
        </span>
      </div>
      <div class="issue-info">
        <div class="name">
          <strong>{{ event.event }}</strong>
        </div>
        <div class="description">{{ event.message }}</div>
        <div class="text-right text-muted timestamp">
          <small>
            {{ event.timestamp | amTimeAgo }}
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
