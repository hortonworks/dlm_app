import { Component, Input, OnInit } from '@angular/core';
import { Job } from 'models/job.model';
import { JOB_STATUS } from 'constants/status.constant';
import { TranslateService } from '@ngx-translate/core';

// todo: job messsage is missing
@Component({
  selector: 'dlm-issues-list-item',
  template: `
    <div class="issue-list-item-container">
      <dlm-job-status [job]="job" class="issue-status"></dlm-job-status>
      <div class="issue-info">
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
    const { FAILED, IN_PROGRESS, WARNINGS, SUCCESS } = JOB_STATUS;
    const statusText = {
      [FAILED]: this.t.instant('page.overview.issues.list.status.failed'),
      [IN_PROGRESS]: this.t.instant('page.overview.issues.list.status.in_progress'),
      [WARNINGS]: this.t.instant('page.overview.issues.list.status.warning'),
      [SUCCESS]: this.t.instant('page.overview.issues.list.status.success')
    };
    return `${this.job.source} - ${statusText[this.job.status]}`;
  }
}
