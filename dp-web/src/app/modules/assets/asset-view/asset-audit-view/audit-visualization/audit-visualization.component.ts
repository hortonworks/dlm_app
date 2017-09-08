/*!
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */
import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

declare const d3: any;
declare const nv: any;

@Component({
  selector: 'dp-audit-visualization',
  templateUrl: './audit-visualization.component.html',
  styleUrls: ['./audit-visualization.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AuditVisualizationComponent implements OnInit, AfterViewInit {

  @ViewChild('stackedbarchart') stackedBarChart: ElementRef;
  @ViewChild('donutchart') donutChart: ElementRef;

  filterOptions: any[] = [];
  filters = [];
  searchText: string;
  showFilterListing = false;
  selectedFilterIndex = -1;
  private availableFilterCount = 0;

  users = ['insurance_admin', 'admin', 'customer'];
  result = ['Authorized', 'Unauthorized'];

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick($event: MouseEvent, targetElement: HTMLElement): void {
    if (targetElement.id === 'search') {
      return;
    }
    this.showFilterListing = false;
  }

  test_data = [
    {
      key: 'Allowed',
      color: '#16b273',
      values: [
        {x: 'Mon', y: 310},
        {x: 'Tue', y: 500},
        {x: 'Wed', y: 400},
        {x: 'Thu', y: 220},
        {x: 'Fri', y: 500},
        {x: 'Sat', y: 80},
        {x: 'Sun', y: 20}
      ]
    },
    {
      key: 'Unauthorised',
      color: '#f0685c',
      values: [
        {x: 'Mon', y: 0},
        {x: 'Tue', y: 35},
        {x: 'Wed', y: 40},
        {x: 'Thu', y: 160},
        {x: 'Fri', y: 100},
        {x: 'Sat', y: 10},
        {x: 'Sun', y: 0}
      ]
    }
  ];
  test_data_per_user = [
    {
      key: 'Allowed',
      color: '#16b273',
      values: [
        {x: 'Mon', y: 10},
        {x: 'Tue', y: 50},
        {x: 'Wed', y: 40},
        {x: 'Thu', y: 22},
        {x: 'Fri', y: 50},
        {x: 'Sat', y: 8},
        {x: 'Sun', y: 2}
      ]
    },
    {
      key: 'Unauthorised',
      color: '#f0685c',
      values: [
        {x: 'Mon', y: 0},
        {x: 'Tue', y: 3},
        {x: 'Wed', y: 4},
        {x: 'Thu', y: 16},
        {x: 'Fri', y: 10},
        {x: 'Sat', y: 1},
        {x: 'Sun', y: 0}
      ]
    }
  ];
  test_data_unauthorised_per_user = [
    {
      key: 'Unauthorised',
      color: '#f0685c',
      values: [
        {x: 'Mon', y: 0},
        {x: 'Tue', y: 3},
        {x: 'Wed', y: 4},
        {x: 'Thu', y: 16},
        {x: 'Fri', y: 10},
        {x: 'Sat', y: 1},
        {x: 'Sun', y: 0}
      ]
    }
  ];
  test_data_authorised_per_user = [
    {
      key: 'Allowed',
      color: '#16b273',
      values: [
        {x: 'Mon', y: 10},
        {x: 'Tue', y: 50},
        {x: 'Wed', y: 40},
        {x: 'Thu', y: 22},
        {x: 'Fri', y: 50},
        {x: 'Sat', y: 8},
        {x: 'Sun', y: 2}
      ]
    },
  ];
  test_data_unauthorised = [
    {
      key: 'Unauthorised',
      color: '#f0685c',
      values: [
        {x: 'Mon', y: 0},
        {x: 'Tue', y: 35},
        {x: 'Wed', y: 40},
        {x: 'Thu', y: 160},
        {x: 'Fri', y: 100},
        {x: 'Sat', y: 10},
        {x: 'Sun', y: 0}
      ]
    }
  ];
  test_data_allowed = [
    {
      key: 'Allowed',
      color: '#16b273',
      values: [
        {x: 'Mon', y: 310},
        {x: 'Tue', y: 500},
        {x: 'Wed', y: 400},
        {x: 'Thu', y: 220},
        {x: 'Fri', y: 500},
        {x: 'Sat', y: 80},
        {x: 'Sun', y: 20}
      ]
    }
  ];

  donutChartData = [
    {
      'label': 'Update',
      'value': 1470
    },
    {
      'label': 'Select',
      'value': 2730
    }
  ];

  donutChartDataPerUser = [
    {
      'label': 'Update',
      'value': 47
    },
    {
      'label': 'Select',
      'value': 100
    }
  ];


  static optionListClass = 'option-value';
  static highlightClass = 'highlighted-filter';

  filterFields = [
    {key: 'user', display: 'User'},
    {key: 'result', display: 'Result'}];

  constructor() {
  }


  ngAfterViewInit() {
    this.createStackedBarChart(this.test_data);
    this.createDonutChart(this.donutChartData);
  }

  ngOnInit() {
  }

  createStackedBarChart(chartData) {
    let self = this;
    nv.addGraph({
      generate: function () {
        let width = self.stackedBarChart.nativeElement.style.width,//nv.utils.windowSize().width,
          height = self.stackedBarChart.nativeElement.style.height; //nv.utils.windowSize().height;
        let chart = nv.models.multiBarChart()
          .width(width)
          .height(height)
          .stacked(true);
        chart.tooltip.contentGenerator(function (data) {
          let i = data.index;
          let tooltip = '<div class="chart-tooltip">';
          if (chartData.length > 1) {
            tooltip += '<div><i class="fa fa-circle" style="color: ' + chartData[0].color + '"></i> <strong class="value">' + chartData[0].values[i].y + '</strong>' + chartData[0].values[i].key + '</div>';
            tooltip += '<div><i class="fa fa-circle" style="color: ' + chartData[1].color + '"></i> <strong class="value">' + chartData[1].values[i].y + '</strong>' + chartData[1].values[i].key + '</div>';
          } else {
            tooltip += '<div><i class="fa fa-circle" style="color: ' + chartData[0].color + '"></i> <strong class="value">' + chartData[0].values[i].y + '</strong>' + chartData[0].values[i].key + '</div>';
          }

          return tooltip;
        });
        chart.dispatch.on('renderEnd', function () {
          console.log('Render Complete');
        });
        chart.groupSpacing(0.7);
        let svg = d3.select('#allowedVsUnauthorisedAccess svg').datum(chartData);
        console.log('calling chart');
        svg.transition().duration(500).call(chart);
        d3.select('#allowedVsUnauthorisedAccess svg')
          .attr('width', width)
          .attr('height', height)
          .transition().duration(0);

        return chart;
      },
      callback: function (graph) {
        nv.utils.windowResize(function () {
          let width = self.stackedBarChart.nativeElement.style.width,//nv.utils.windowSize().width,
            height = self.stackedBarChart.nativeElement.style.height; //nv.utils.windowSize().height;
          graph.width(width).height(height);
          d3.select('#allowedVsUnauthorisedAccess svg')
            .attr('width', width)
            .attr('height', height)
            .transition().duration(0)
            .call(graph);
        });
      }
    });
  }

  createDonutChart(chartData) {
    let self = this;
    let myColors = ['#16b273', '#128fc4'];
    d3.scale.myColors = function () {
      return d3.scale.ordinal().range(myColors);
    };
    let count = chartData[0].value + chartData[1].value;
    count = count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count;
    nv.addGraph({
      generate: function () {
        let width = self.donutChart.nativeElement.width,//nv.utils.windowSize().width,
          height = self.donutChart.nativeElement.height; //nv.utils.windowSize().height;
        let chart = nv.models.pieChart()
          .x(function (d) {
            return d.label
          })
          .y(function (d) {
            return d.value
          })
          .showLabels(true)     //Display pie labels
          .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
          .labelType('percent') //Configure what type of data to show in the label. Can be "key", "value" or "percent"
          .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
          .donutRatio(0.35)     //Configure how big you want the donut hole size to be.
          .pieLabelsOutside(true)
          .title(count)
          .color(d3.scale.myColors().range());
        chart.dispatch.on('renderEnd', function () {
          console.log('Render Complete');
        });
        let svg = d3.select('#selectVsUpdate svg').datum(chartData);
        console.log('calling chart');
        svg.transition().duration(500).call(chart);
        d3.select('#selectVsUpdate svg')
          .attr('width', width)
          .attr('height', height)
          .transition().duration(0);

        return chart;
      },
      callback: function (graph) {
        nv.utils.windowResize(function () {
          let width = self.donutChart.nativeElement.width,//nv.utils.windowSize().width,
            height = self.donutChart.nativeElement.height; //nv.utils.windowSize().height;
          graph.width(width).height(height);
          d3.select('#selectVsUpdate svg')
            .attr('width', width)
            .attr('height', height)
            .transition().duration(0)
            .call(graph);
        });
      }
    });
  }

  private highlightSelected() {
    let filterOptions = document.getElementsByClassName(AuditVisualizationComponent.optionListClass);
    let highlighted = document.getElementsByClassName(AuditVisualizationComponent.highlightClass);
    for (let i = 0; i < highlighted.length; i++) {
      let elt = highlighted.item(i);
      elt.className = 'option-value';
    }
    let highlightedOption: any = filterOptions[this.selectedFilterIndex];
    highlightedOption.focus();
    highlightedOption.className += ` ${AuditVisualizationComponent.highlightClass}`;
  }

  handleKeyboardEvents(event, display?, key?, value?) {
    let keyPressed = event.keyCode || event.which;
    if (keyPressed === 40 && this.selectedFilterIndex < this.availableFilterCount - 1) {
      ++this.selectedFilterIndex;
      this.highlightSelected();
      return;
    } else if (keyPressed === 38 && this.selectedFilterIndex !== 0) {
      --this.selectedFilterIndex;
      this.highlightSelected();
      return;
    } else if (keyPressed === 13 && this.selectedFilterIndex !== -1) {
      this.addToFilter(display, key, value);
      return;
    }
  }

  filter() {
    if (this.filters.length === 2) {
      this.createStackedBarChart(this.test_data_per_user);
      let resultFilter = this.filters.find(filter => filter.key === 'result');
      if (resultFilter.value === 'Authorized') {
        this.createStackedBarChart(this.test_data_authorised_per_user);
      } else {
        this.createStackedBarChart(this.test_data_unauthorised_per_user);
      }
    } else if (this.filters.length === 1 && this.filters.find(filter => filter.key === 'user')) {
      this.createStackedBarChart(this.test_data_per_user);
      this.createDonutChart(this.donutChartDataPerUser);
    } else if (this.filters.length === 1 && this.filters.find(filter => filter.key === 'result')) {
      let resultFilter = this.filters.find(filter => filter.key === 'result');
      if (resultFilter.value === 'Authorized') {
        this.createStackedBarChart(this.test_data_allowed);
      } else {
        this.createStackedBarChart(this.test_data_unauthorised);
      }
    } else {
      this.createStackedBarChart(this.test_data);
      this.createDonutChart(this.donutChartData);
    }
    this.selectedFilterIndex = -1;
  }

  removeFilter(filter) {
    for (let i = 0; i < this.filters.length; i++) {
      let filterItem = this.filters[i];
      if (filterItem.key === filter.key && filterItem.value === filter.value) {
        this.filters.splice(i, 1);
        break;
      }
    }
    this.filter();
  }

  addToFilter(display, key, value) {
    if (!this.filters.find(filter => filter.key === key && filter.value === value)) {
      this.filters.push({'key': key, 'value': value, 'display': display});
    }
    this.filter();
    this.searchText = '';
    this.showFilterListing = false;
  }

  showOptions(event) {
    let keyPressed = event.keyCode || event.which;
    if (keyPressed === 38 || keyPressed === 40) {
      this.handleKeyboardEvents(event);
    } else {
      this.filterOptions = [];
      let term = event.target.value.trim().toLowerCase();
      if (term.length === 0) {
        this.selectedFilterIndex = -1;
        this.showFilterListing = false;
        return;
      }
      this.availableFilterCount = 0;
      if (!this.filters.find(option => option.key === 'user')) {
        let users = this.users.filter(user => user.toLowerCase().indexOf(term) >= 0);
        if (users && users.length) {
          this.filterOptions.push({'displayName': 'User', 'key': 'user', values: users});
          this.availableFilterCount += users.length
        }
      }
      if (!this.filters.find(option => option.key === 'result')) {
        let result = this.result.filter(res => res.toLowerCase().indexOf(term) >= 0);
        if (result && result.length) {
          this.filterOptions.push({'displayName': 'Result', 'key': 'result', values: result});
          this.availableFilterCount += result.length;
        }
      }

      this.showFilterListing = true;
    }
  }
}
