/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Job } from 'models/job.model';
import { JOB_STATUS } from 'constants/status.constant';

@Component({
  selector: 'dlm-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss']
})
export class JobStatusComponent implements OnInit, AfterViewInit {
  JOB_STATUS = JOB_STATUS;
  @Input() job: Job;
  @ViewChild('job_status') jobStatus: ElementRef;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    /*if (this.jobStatus && this.job.status === JOB_STATUS.RUNNING) {
      const $el = $(this.jobStatus.nativeElement);
      for (let i = 0; i < 5; i++) {
        $el.fadeTo(500, 0.5).fadeTo(500, 1.0);
      }
    }*/
  }
}
