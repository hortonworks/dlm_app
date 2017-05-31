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
