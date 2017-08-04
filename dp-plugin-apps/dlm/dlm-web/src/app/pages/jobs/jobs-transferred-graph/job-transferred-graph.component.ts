/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input } from '@angular/core';
import { Job } from 'models/job.model';
import { JOB_STATUS } from 'constants/status.constant';

@Component({
  selector: 'job-transferred-graph',
  template: `
    <canvas baseChart [style.display]="'block'"
            width="100"
            height="30"
            [datasets]="graphData"
            [labels]="graphLabels"
            [colors]="graphColors"
            [legend]="false"
            [options]="graphOptions"
            [chartType]="'line'"></canvas>
    <ng-content></ng-content>
  `
})
export class JobTransferredGraphComponent {

  private colorStatusMap = {
    [JOB_STATUS.WARNINGS]: '#E98A40',
    [JOB_STATUS.FAILED]: '#EF6162'
  };

  @Input() job: Job;

  get graphLabels(): Array<any> {
    return this.job.graphData.map(() => '');
  };

  get graphColors(): Array<any> {
    const color = this.colorStatusMap[this.job.status];
    return [
      {
        backgroundColor: 'none',
        borderColor: color,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: color
      }
    ];
  };

  get graphData(): Array<any> {
    return [
      {data: this.job.graphData, fill: false, label: ''}
    ];
  };

  graphOptions = {
    animation: false,
    elements: {
      point: {
        radius: 0
      }
    },
    tooltips: {
      enabled: false
    },
    responsive: false,
    scales: {
      xAxes: [{
        display: false,
        gridLines: {
          display: false
        }
      }],
      yAxes: [{
        display: false,
        gridLines: {
          display: false
        }
      }]
    }
  };

  constructor() {
  }

}
