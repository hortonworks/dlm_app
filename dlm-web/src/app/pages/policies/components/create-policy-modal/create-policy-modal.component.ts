/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { getAllPairings } from 'selectors/pairing.selector';
import { loadPairings } from 'actions/pairing.action';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { loadAccounts } from 'actions/cloud-account.action';
import { getAllAccounts } from 'selectors/cloud-account.selector';
import { CloudAccount } from 'models/cloud-account.model';
import { loadBeaconAdminStatus, loadBeaconConfigStatus } from 'actions/beacon.action';
import { getAllBeaconAdminStatuses } from 'selectors/beacon.selector';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { loadClusters, loadClustersStatuses } from 'actions/cluster.action';
import { wizardResetAllSteps } from 'actions/policy.action';
import { getClustersWithBeacon } from 'selectors/cluster.selector';
import { Cluster } from 'models/cluster.model';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { PolicyService } from 'services/policy.service';
import { loadAmbariPrivileges } from 'actions/ambari.action';

const PAIR_REQUEST = '[CREATE POLICY] PAIR_REQUEST';
const CLUSTERS_REQUEST = '[CREATE POLICY] CLUSTERS_REQUEST';
const CLUSTERS_STATUSES_REQUEST = '[CREATE POLICY] CLUSTERS_STATUSES_REQUEST';
const ACCOUNTS_REQUEST = '[CREATE POLICY] ACCOUNTS_REQUEST';
const ADMIN_STATUS_REQUEST = '[CREATE POLICY] ADMIN_STATUS_REQUEST';
const BEACON_CONFIG_STATUS_REQUEST = '[CREATE POLICY] BEACON_CONFIG_STATUS_REQUEST';
const AMBARI_PRIVILEGES_REQUEST = '[CREATE POLICY] AMBARI_PRIVILEGES_REQUEST';

@Component({
  selector: 'dlm-create-policy-modal',
  template: `
    <dlm-modal-dialog #createPolicyModalDialog
      [title]="'page.policies.header_create'"
      [modalSize]="modalSize"
      [showFooter]="false"
      [showOk]="false"
      [showCancel]="false"
      [subtitleText]="'page.policies.subpage.create_policy.help_text' | translate"
      [subtitleLink]="'page.policies.subpage.create_policy.help_url' | translate"
      (onClose)="handleCloseModal()">
      <dlm-modal-dialog-body>
        <dlm-progress-container [progressState]="overallProgress$ | async">
          <div>
            <dlm-create-policy-wizard
              [accounts]="accounts$ | async"
              [clusters]="clusters$ | async"
              [pairings]="pairings$ | async"
              [sourceClusterId]="sourceClusterId"
              (onCancel)="handleOnCancel($event)"
              >
            </dlm-create-policy-wizard>
          </div>
        </dlm-progress-container>
      </dlm-modal-dialog-body>
    </dlm-modal-dialog>
  `,
  styleUrls: ['./create-policy-modal.component.scss']
})
export class CreatePolicyModalComponent implements OnInit, OnDestroy {
  pairings$: Observable<Pairing[]>;
  accounts$: Observable<CloudAccount[]>;
  clusters$: Observable<Cluster[]>;
  overallProgress$: Observable<ProgressState>;
  loadParamsSubscription$;
  sourceClusterId: number;
  modalSize = ModalSize.FULLPAGE;
  @ViewChild('createPolicyModalDialog') modalDialog: ModalDialogComponent;

  constructor(private store: Store<State>, private route: ActivatedRoute, private router: Router, protected policyService: PolicyService) {
  }

  ngOnInit() {
    this.store.dispatch(loadPairings(PAIR_REQUEST));
    this.store.dispatch(loadAccounts(ACCOUNTS_REQUEST));
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST));
    this.store.dispatch(loadClustersStatuses(CLUSTERS_STATUSES_REQUEST));
    this.store.dispatch(loadBeaconAdminStatus({requestId: ADMIN_STATUS_REQUEST}));
    this.store.dispatch(loadBeaconConfigStatus({requestId: BEACON_CONFIG_STATUS_REQUEST}));
    this.store.dispatch(loadAmbariPrivileges({requestId: AMBARI_PRIVILEGES_REQUEST}));
    this.pairings$ = this.store.select(getAllPairings);
    this.accounts$ = this.store.select(getAllAccounts);
    this.clusters$ = this.store.select(getClustersWithBeacon);
    const requestIds = [
      ACCOUNTS_REQUEST,
      PAIR_REQUEST,
      CLUSTERS_STATUSES_REQUEST,
      AMBARI_PRIVILEGES_REQUEST,
      ADMIN_STATUS_REQUEST,
      CLUSTERS_REQUEST,
      BEACON_CONFIG_STATUS_REQUEST
    ];
    this.overallProgress$ = this.store.select(getMergedProgress.apply(null, requestIds));
    this.loadParamsSubscription$ = this.route.queryParams
      .subscribe(params => {
        const clusterId = params['sourceClusterId'];
        if (clusterId) {
          this.sourceClusterId = clusterId;
        }
      });
  }

  handleOnCancel(flag) {
    if (flag === true) {
      this.handleCloseModal();
    }
  }

  handleCloseModal() {
    this.store.dispatch(wizardResetAllSteps());
    this.router.navigate(['/policies']);
  }

  public show() {
    this.modalDialog.show();
  }

  ngOnDestroy() {
    this.loadParamsSubscription$.unsubscribe();
  }
}
