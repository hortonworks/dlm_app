import {Component, Input, AfterViewInit, OnChanges, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import * as Rx from 'rxjs';
import * as moment from 'moment';

import {BackupPolicyService} from '../../services/backup-policy.service';
import {BackupPolicyInDetail} from '../../models/backup-policy';

@Component({
    selector: 'backup-policy-list' ,
    styleUrls: ['./backup-policy-list.component.scss'],
    templateUrl: './backup-policy-list.component.html'
})
export class BackupPolicyListComponent implements OnChanges {

    policies: BackupPolicyInDetail[] = [];
    rxPolicies: Rx.Subject<string> = new Rx.Subject<string>();

    @Input() dataCenterId: string = '';

    constructor(
      private router: Router,
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
      let navigationExtras = {
            queryParams : {
            }
        };
        this.router.navigate([`/backup-policy/${cPolicyId}`], navigationExtras);
        return false;
    }

    doGetMoment(time: string) {
      return moment(time).fromNow();
    }
}
