/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { DoughnutChartData } from 'components/doughnut-chart/';
import { ResourceChartData } from './resource-chart-data.type';
import { sum } from 'utils/array-util';

@Component({
  selector: 'dlm-resource-charts',
  templateUrl: './resource-charts.component.html',
  styleUrls: ['./resource-charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceChartsComponent {
  chartSize = 100;

  @Input() resourceData: ResourceChartData;

  get charts(): DoughnutChartData[] {
    return Object.keys(this.resourceData).map(resourceName => {
      const data = this.resourceData[resourceName].data;
      return <DoughnutChartData>{
        ...this.resourceData[resourceName],
        title: this.t.instant(`page.overview.charts.${resourceName}`),
        total: sum(data)
      };
    });
  }

  constructor(private t: TranslateService) {
  }
}
