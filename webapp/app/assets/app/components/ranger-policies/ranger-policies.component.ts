import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {RangerService} from '../../services/ranger.service';
import {RangerPolicies} from '../../models/ranger-policies';
import Rx from 'rxjs/Rx';

@Component({
    selector: 'ranger-policies',
    templateUrl: 'assets/app/components/ranger-policies/ranger-policies.component.html',
    styleUrls: ['assets/app/components/ranger-policies/ranger-policies.component.css']
})
export class RangerPoliciesComponent implements OnInit, OnChanges {

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

    constructor(private rangerPoliciesService: RangerService) {

      this.rxInputChange
        .flatMap(({resourceId, resourceType, dataLakeId, clusterId}) => this.rangerPoliciesService.getPolicies(resourceId, resourceType, dataLakeId, clusterId))
        .subscribe(policies => this.policies = RangerPolicies.getData(policies));

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
}
