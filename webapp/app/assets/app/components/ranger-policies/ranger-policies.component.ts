import {Component, OnInit, Input} from '@angular/core';
import {RangerPoliciesService} from '../../services/ranger-policies.service';
import {RangerPolicies} from '../../models/ranger-policies';

@Component({
    selector: 'ranger-policies',
    templateUrl: 'assets/app/components/ranger-policies/ranger-policies.component.html',
    styleUrls: ['assets/app/components/ranger-policies/ranger-policies.component.css']
})
export class RangerPoliciesComponent implements OnInit {
    @Input()
    resourceId: string = '';
    @Input()
    resourceType: string = '';
    @Input()
    dataLakeId: string = '';
    @Input()
    clusterId: string = '';

    policesData: RangerPolicies[] = [];

    constructor(private rangerPoliciesService: RangerPoliciesService) {

    }

    ngOnInit() {
        this.rangerPoliciesService.get(this.resourceId,this.resourceType,this.dataLakeId,this.clusterId).subscribe(policiesData => {
            this.policesData = RangerPolicies.getData(policiesData);
        });
    }
}