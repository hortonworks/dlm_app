import {Component, OnInit} from '@angular/core';
import {RangerPoliciesService} from '../../services/ranger-policies.service';
import {RangerPolicies} from '../../models/ranger-policies';

@Component({
    selector: 'ranger-policies',
    templateUrl: 'assets/app/components/ranger-policies/ranger-policies.component.html',
    styleUrls: ['assets/app/components/ranger-policies/ranger-policies.component.css']
})
export class RangerPoliciesComponent implements OnInit {
    policesData: RangerPolicies[] = [];

    constructor(private rangerPoliciesService: RangerPoliciesService) {
    }

    ngOnInit() {
        this.rangerPoliciesService.get().subscribe(policiesData => {
            this.policesData = policiesData;
        });
    }
}