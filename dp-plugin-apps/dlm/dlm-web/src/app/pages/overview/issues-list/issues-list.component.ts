import { Component, Input, HostBinding } from '@angular/core';
import { Job } from 'models/job.model';

@Component({
  selector: 'dlm-issues-list',
  template: `
    <div class="row" *ngFor="let job of jobs | slice:0:visibleItems">
      <div class="col-md-12">
        <dlm-issues-list-item [job]="job">
        </dlm-issues-list-item>
      </div>
    </div>
    <div class="row">
      <div class="pull-right view-all">
        <small class="text-primary actionable" (click)="showAll()" *ngIf="!isAllVisible">
          <strong>{{'page.overview.issues.list.view_all' | translate}}</strong>
        </small>
      </div>
    </div>
  `,
  styleUrls: ['./issues-list.component.scss']
})
export class IssuesListComponent {
  visibleItems = 3;
  @Input() jobs: Job[];
  @HostBinding('class.all-visible') get isVisible() { return this.isAllVisible; };

  get isAllVisible(): boolean {
    return this.jobs && this.visibleItems === this.jobs.length;
  }


  showAll() {
    this.visibleItems = this.jobs.length;
  }
}
