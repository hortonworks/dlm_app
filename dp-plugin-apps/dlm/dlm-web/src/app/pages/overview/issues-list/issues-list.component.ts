/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, Output, HostBinding, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Event } from 'models/event.model';

@Component({
  selector: 'dlm-issues-list',
    template: `
      <div class="issues-list-container">
        <div class="row" *ngIf="!events.length">
          <div class="col-xs-12">
            <p class="text-muted no-issues">{{'page.overview.issues.list.empty_list' | translate}}</p>
          </div>
        </div>
        <div class="row" *ngFor="let event of events | slice:0:visibleItems">
          <div class="col-xs-12">
            <dlm-issues-list-item
              [event]="event">
            </dlm-issues-list-item>
          </div>
        </div>
      </div>
      <div class="view-all-container" *ngIf="events.length">
        <div class="pull-right view-all">
          <small qe-attr="go-to-notifications" class="text-primary actionable" (click)="showAll()">
            <strong>{{'page.overview.issues.list.view_all' | translate}}</strong>
          </small>
        </div>
      </div>
  `,
  styleUrls: ['./issues-list.component.scss']
})
export class IssuesListComponent {
  visibleItems = 5;
  @Input() events: Event[];

  @HostBinding('class') className = 'all-visible';

  constructor(private router: Router) { }

  showAll() {
    this.router.navigate(['/notifications']);
  }
}
