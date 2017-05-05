import { Component, Input, OnInit } from '@angular/core';
import { Job } from 'models/job.model';
import { TranslateService } from '@ngx-translate/core';

// todo: job messsage is missing
@Component({
  selector: 'dlm-issues-list-item',
  template: `
    <div class="row">
      <div class="col-md-1">
        <dlm-job-status [job]="job"></dlm-job-status>
      </div>
      <div class="col-md-11">
        <div>
          <strong>{{jobTitle}}</strong>
        </div>
        <div><i class="fa fa-minus"></i></div>
        <div class="text-right text-muted">
          <small>
            {{job.endTime > 0 ? (job.endTime | amTimeAgo) : ('common.status.in_progress' | translate)}}
          </small>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./issues-list-item.component.scss']
})
export class IssuesListItemComponent implements OnInit {
  jobTitle = '';
  @Input() job: Job;

  constructor(private t: TranslateService) { }

  ngOnInit() {
    this.jobTitle = this.formatJobTitle();
  }

  formatJobTitle() {
    const statusText = {
      Failed: this.t.instant('page.overview.issues.list.status.failed'),
      'In Progress': this.t.instant('page.overview.issues.list.status.in_progress'),
      Warnings: this.t.instant('page.overview.issues.list.status.warning')
    };
    return `${this.job.source} - ${statusText[this.job.status]}`;
  }
}
