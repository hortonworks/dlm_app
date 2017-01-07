import {Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
import {RangerService} from '../../services/ranger.service';
import {RangerPolicies} from '../../models/ranger-policies';
import Rx from 'rxjs/Rx';

declare let d3: any;
declare let nv: any;

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
}
