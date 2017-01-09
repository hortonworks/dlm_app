import {Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
import {RangerService} from '../../services/ranger.service';
import {RangerPolicies} from '../../models/ranger-policies';
import Rx from 'rxjs/Rx';

declare let d3: any;
declare let nv: any;
declare let moment: any;

@Component({
    selector: 'ranger-policies',
    templateUrl: 'assets/app/components/ranger-policies/ranger-policies.component.html',
    styleUrls: ['assets/app/components/ranger-policies/ranger-policies.component.css']
})
export class RangerPoliciesComponent implements OnInit, OnChanges, AfterViewInit {

  rxInputChange: Rx.Subject<{
    resourceId: string,
    resourceType: string,
    dataLakeId: string,
    clusterId: string
  }> = new Rx.Subject<{
    resourceId: string,
    resourceType: string,
    dataLakeId: string,
    clusterId: string
  }>();

    @Input()
    resourceId: string = '';
    @Input()
    resourceType: string = '';
    @Input()
    dataLakeId: string = '';
    @Input()
    clusterId: string = '';

    policies: RangerPolicies[] = [];
    access: any[] = [];
    users: any[] = [];

    isPolicyRequestInProgress: boolean = false;
    isAccessRequestInProgress: boolean = false;
    isUsersRequestInProgress: boolean = false;

    constructor(private rangerPoliciesService: RangerService) {

      this.rxInputChange
        .subscribe(() => {
          // marking status as in progress

          this.isPolicyRequestInProgress = true;
          this.isAccessRequestInProgress = true;
          this.isUsersRequestInProgress = true;
        });

      this.rxInputChange
        .flatMap(({resourceId, resourceType, dataLakeId, clusterId}) => this.rangerPoliciesService.getPolicies(resourceId, resourceType, dataLakeId, clusterId))
        .subscribe(policies => {
          this.isPolicyRequestInProgress = false;
          this.policies = RangerPolicies.getData(policies);

          const countGroupedByDate =
            this.policies
              .reduce((accumulator, cPolicy) => {
                const dateKey = moment(cPolicy.time).format('YYYY-MM-DD');
                const countOnDate = accumulator[dateKey] || 0;
                accumulator[dateKey] = countOnDate + 1;
                return accumulator;
              }, {});

          const dateKeysSorted =
            Object.keys(countGroupedByDate)
              .sort();

          const today = moment().format('YYYY-MM-DD');
          let cDay = dateKeysSorted[0];

          const dateKeysFilled = [];
          while(cDay < today) {
            dateKeysFilled.push(moment(cDay).format('YYYY-MM-DD'));
            cDay = moment(cDay).add(1, 'days').format('YYYY-MM-DD');
          }
          const data = [{
            values: dateKeysFilled.map(cDateKey => ({x: moment(cDateKey).toDate(), y: countGroupedByDate[cDateKey] ? countGroupedByDate[cDateKey] : 0}))
          }];

          this.drawTimeSeries('#ranger_barchart_policies', data);
        });

      this.rxInputChange
        .flatMap(({resourceId, resourceType, dataLakeId, clusterId}) => this.rangerPoliciesService.getAccess(resourceId, resourceType, dataLakeId, clusterId))
        .subscribe(access => {
          this.isAccessRequestInProgress = false;
          this.access = access;
          this.drawChart('#ranger_barchart_access', access);
        });

      this.rxInputChange
        .flatMap(({resourceId, resourceType, dataLakeId, clusterId}) => this.rangerPoliciesService.getUsers(resourceId, resourceType, dataLakeId, clusterId))
        .subscribe(users => {
          this.isUsersRequestInProgress = false;
          this.users = users;
          this.drawChart('#ranger_barchart_users', users);
        });

    }

    ngOnInit() {
      //
    }

    ngOnChanges(changes: SimpleChanges) {
      if(this.resourceId && this.resourceType && this.dataLakeId && this.clusterId) {
        this.rxInputChange.next({
          resourceId: this.resourceId,
          resourceType: this.resourceType,
          dataLakeId: this.dataLakeId,
          clusterId: this.clusterId
        });
      }
    }

    ngAfterViewInit() {
      // if(this.resourceId && this.resourceType && this.dataLakeId && this.clusterId) {
      //   this.rxInputChange.next({
      //     resourceId: this.resourceId,
      //     resourceType: this.resourceType,
      //     dataLakeId: this.dataLakeId,
      //     clusterId: this.clusterId
      //   });
      // }
    }

    drawChart(domSelector: string, data: any[]) {

      nv.addGraph(() => {
        const chart = nv.models.discreteBarChart()
          .x(d => d.label)
          .y(d => d.value)
          .height(300)
          .staggerLabels(true)
          .showValues(true)
          .duration(350);

        if(data.length <= 5) {
          chart.width(600);
        }

        chart.yAxis.tickFormat(d3.format('d'));

          d3
            .select(domSelector)
            .datum([{
              key: 'Ranger Data',
              values: data
            }])
            .call(chart);

          nv.utils.windowResize(chart.update);

          return chart;
      });

    }



    drawTimeSeries(domSelector: string, data: any[]) {

     nv.addGraph(function() {
        const chart = nv.models.historicalBarChart();
        chart
            // .x(function(d) { return d[0]; })
            // .y(function(d) { return d[1]; })
            .xScale(d3.time.scale()) // use a time scale instead of plain numbers in order to get nice round default values in the axis
            // .color(['#68c'])
            .height(300)
            .useInteractiveGuideline(true) // check out the css that turns the guideline into this nice thing
            // .tooltips(true)
            // .tooltipContent(function (key, x, y, graph) {
            //     const content = '<h3 style='background-color: ' + y.color + ''>' + d3.time.format('%b %-d, %Y %I:%M%p')(new Date(graph.point.x)) + '</h3>';
            //     content += '<p>' +  y + '</p>';
            //     return content;
            // })
            // .margin({'left': 80, 'right': 50, 'top': 20, 'bottom': 30,})
            .noData('There is no data to display.');

        const tickMultiFormat = d3.time.format.multi([
            ['%-I:%M%p', function(d) { return d.getMinutes(); }], // not the beginning of the hour
            ['%-I%p', function(d) { return d.getHours(); }], // not midnight
            ['%b %-d', function(d) { return d.getDate() !== 1; }], // not the first of the month
            ['%b %-d', function(d) { return d.getMonth(); }], // not Jan 1st
            ['%Y', function() { return true; }]
        ]);
        chart.xAxis
            .showMaxMin(false)
            // .rotateLabels(-45) // Want longer labels? Try rotating them to fit easier.
            .tickPadding(10)
            .tickFormat(function (d) { return tickMultiFormat(new Date(d)); })
            ;

        chart.yAxis
            .showMaxMin(false)
            // .highlightZero(true)
            // .axisLabel('Some vertical value')
            // .axisLabelDistance(15)
            .tickFormat(d3.format('d'))
            ;

        const svgElem = d3.select(domSelector);
        svgElem
            .datum(data)
            .transition()
            .call(chart);

        // make our own x-axis tick marks because NVD3 doesn't provide any
        const tickY2 = chart.yAxis.scale().range()[1];
        const lineElems = svgElem
            .select('.nv-x.nv-axis.nvd3-svg')
            .select('.nvd3.nv-wrap.nv-axis')
            .select('g')
            .selectAll('.tick')
            .data(chart.xScale().ticks())
                .append('line')
                .attr('class', 'x-axis-tick-mark')
                .attr('x2', 0)
                .attr('y1', tickY2 + 4)
                .attr('y2', tickY2)
                .attr('stroke-width', 1)
            ;

        // set up the tooltip to display full dates
        const tsFormat = d3.time.format('%b %-d, %Y %I:%M%p');
        const contentGenerator = chart.interactiveLayer.tooltip.contentGenerator();
        const tooltip = chart.interactiveLayer.tooltip;
        tooltip.contentGenerator(function (d) { d.value = d.series[0].data.x; return contentGenerator(d); });
        tooltip.headerFormatter(function (d) { return tsFormat(new Date(d)); });

        return chart;
    });

    }
}
