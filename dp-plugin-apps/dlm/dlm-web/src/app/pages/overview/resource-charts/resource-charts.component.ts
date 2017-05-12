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
      return {
        ...this.resourceData[resourceName],
        title: this.t.instant(`page.overview.charts.${resourceName}`),
        total: sum(data)
      };
    });
  }

  constructor(private t: TranslateService) { }
}
