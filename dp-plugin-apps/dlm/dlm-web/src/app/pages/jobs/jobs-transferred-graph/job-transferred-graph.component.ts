import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Job} from '../../../models/job.model';

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
export class JobTransferredGraphComponent implements OnChanges, OnInit {

  private colorStatusMap = {
    'Warnings': '#E98A40',
    'Failed': '#EF6162'
  };

  @Input() job: Job;

  graphLabels: Array<any> = [];
  graphColors: Array<any> = [];
  graphData: Array<any> = [];
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

  ngOnInit() {
    this.calculateAll();
  }

  ngOnChanges() {
    this.calculateAll();
  }

  calculateAll() {
    this.calculateColors();
    this.calculateData();
    this.calculateLabels();
  }

  calculateData() {
    this.graphData = [
      {data: this.job.graphData, fill: false, label: ''}
    ];
  }

  calculateColors() {
    const color = this.colorStatusMap[this.job.status];
    this.graphColors = [
      {
        backgroundColor: 'none',
        borderColor: color,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: color
      }
    ];
  }

  calculateLabels() {
    this.graphLabels = this.job.graphData.map(() => '');
  }

}
