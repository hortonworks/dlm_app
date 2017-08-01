import { Component, Input, Output, HostBinding, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Event } from 'models/event.model';

@Component({
  selector: 'dlm-issues-list',
  template: `
    <div class="row" *ngFor="let event of events | slice:0:visibleItems">
      <div class="col-md-12">
        <dlm-issues-list-item [event]="event" (selectEventEntity)="onSelectEventEntity.emit($event)">
        </dlm-issues-list-item>
      </div>
    </div>
    <div class="row" *ngIf="events.length">
      <div class="pull-right view-all">
        <small qe-attr="go-to-notifications" class="text-primary actionable" (click)="showAll()">
          <strong>{{'page.overview.issues.list.view_all' | translate}}</strong>
        </small>
      </div>
    </div>
    <div class="row" *ngIf="!events.length">
      <div class="col-md-12">
        <p>{{'page.overview.issues.list.empty_list' | translate}}</p>
      </div>
    </div>
  `,
  styleUrls: ['./issues-list.component.scss']
})
export class IssuesListComponent {
  visibleItems = 4;
  @Input() events: Event[];
  @Output() onSelectEventEntity = new EventEmitter<Event>();

  @HostBinding('class') className = 'all-visible';

  constructor(private router: Router) { }

  showAll() {
    this.router.navigate(['/notifications']);
  }
}
