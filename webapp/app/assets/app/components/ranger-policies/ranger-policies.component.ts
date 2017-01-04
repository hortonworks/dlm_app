import {Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
import {RangerService} from '../../services/ranger.service';
import {RangerPolicies} from '../../models/ranger-policies';
import Rx from 'rxjs/Rx';

declare let dX:any;

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

    constructor(private rangerPoliciesService: RangerService) {

      this.rxInputChange
        .flatMap(({resourceId, resourceType, dataLakeId, clusterId}) => this.rangerPoliciesService.getPolicies(resourceId, resourceType, dataLakeId, clusterId))
        .subscribe(policies => this.policies = RangerPolicies.getData(policies));

      this.rxInputChange
        .flatMap(({resourceId, resourceType, dataLakeId, clusterId}) => this.rangerPoliciesService.getAccess(resourceId, resourceType, dataLakeId, clusterId))
        .subscribe(access => {
          this.access = access;
          this.drawChart('#ranger_barchart_access', access);
        });

      this.rxInputChange
        .flatMap(({resourceId, resourceType, dataLakeId, clusterId}) => this.rangerPoliciesService.getUsers(resourceId, resourceType, dataLakeId, clusterId))
        .subscribe(users => {
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

    drawChart(domId: string, data: any[]) {

      const d3 = dX;
      const svg = d3.select(domId),
        margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

      const x =
        d3
          .scaleBand()
          .rangeRound([0, width])
          .padding(0.1);
      x.domain(data.map(function(d) { return d.key; }));

      const y =
        d3
        .scaleLinear()
        .range([height, 0]);
      y.domain([0, d3.max(data, function(d) { return d.value; })]);

      const g = svg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      g.append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', 'translate(0,' + height + ')')
          .call(d3.axisBottom(x));

      const maxValueOfY = d3.max(data, function(d) { return d.value; });
      const maxTicks = maxValueOfY < 5 ? maxValueOfY : maxValueOfY / 5;
      g.append('g')
          .attr('class', 'axis axis--y')
          .call(
            d3
              .axisLeft(y)
              .tickFormat(d3.format('.0f'))
              .ticks(maxTicks)
          );

        g.selectAll('.bar')
          .data(data)
          .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', function(d) { return x(d.key); })
            .attr('width', x.bandwidth())
            .attr('y', function(d) { return y(d.value); })
            .attr('height', function(d) { return height - y(d.value); });
    }
}
