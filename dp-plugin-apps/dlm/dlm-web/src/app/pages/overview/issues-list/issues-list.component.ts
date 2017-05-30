import { Component, Input, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Event } from 'models/event.model';

@Component({
  selector: 'dlm-issues-list',
  template: `
    <div class="row" *ngFor="let event of events | slice:0:visibleItems">
      <div class="col-md-12">
        <dlm-issues-list-item [event]="event">
        </dlm-issues-list-item>
      </div>
    </div>
    <div class="row" *ngIf="events.length">
      <div class="pull-right view-all">
        <small class="text-primary actionable" (click)="showAll()" *ngIf="!isAllVisible">
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
  visibleItems = 3;
  @Input() events: Event[];
  @HostBinding('class.all-visible') get isVisible() { return this.isAllVisible; };

  get isAllVisible(): boolean {
    return this.events && this.visibleItems === this.events.length;
  }

  constructor(private router: Router) { }

  showAll() {
    this.router.navigate(['/notifications']);
  }
}
