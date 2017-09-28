/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input } from '@angular/core';
import { ServiceStatus } from 'models/cluster.model';
import { SERVICE_STATUS } from 'constants/status.constant';
import { SERVICE_STATUS_COLOR } from 'constants/color.constant';

@Component({
  selector: 'dlm-service-status-icon',
  template: `
    <i [ngClass]="['fa', statusIconClass]"
       [ngStyle]="{color: statusIconColor}">
    </i>
  `,
  styles: []
})
export class ServiceStatusIconComponent implements OnInit {

  @Input() serviceStatus: ServiceStatus;

  get statusIconClass(): string {
    if (this.serviceStatus.state === SERVICE_STATUS.UNKNOWN) {
      return 'fa-question-circle';
    }
    return 'fa-exclamation-triangle';
  }

  get statusIconColor(): string {
    return SERVICE_STATUS_COLOR[this.serviceStatus.state];
  }

  constructor() { }

  ngOnInit() {
  }

}
