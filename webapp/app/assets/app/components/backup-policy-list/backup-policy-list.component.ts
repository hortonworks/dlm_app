import {Component, Input, AfterViewInit, OnChanges, SimpleChanges} from '@angular/core';
import Rx from 'rxjs/Rx';

import {BackupPolicyService} from '../../services/backup-policy.service';
import {BackupPolicyInDetail} from '../../models/backup-policy';

@Component({
    selector: 'backup-policy-list' ,
    styleUrls: ['assets/app/components/backup-policy-list/backup-policy-list.component.css'],
    templateUrl: 'assets/app/components/backup-policy-list/backup-policy-list.component.html'
})
export default class BackupPolicyListComponent implements OnChanges {

    policies: BackupPolicyInDetail[] = [];
    rxPolicies: Rx.Subject<string> = new Rx.Subject<string>();

    @Input() dataCenterId: string = '';

    constructor(
      private policyService: BackupPolicyService
    ) {

      this.rxPolicies
        .flatMap(dataCenterId => this.policyService.getByDataCenter(dataCenterId))
        .subscribe(policies => this.policies = policies);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataCenterId'] && changes['dataCenterId'].currentValue) {
            this.rxPolicies.next(changes['dataCenterId'].currentValue);
        }
    }

    doEditPolicy(cPolicyId: string) {
//
    }
}
