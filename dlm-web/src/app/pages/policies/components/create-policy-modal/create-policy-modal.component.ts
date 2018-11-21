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
import { Observable , Subscription, forkJoin, of, combineLatest } from 'rxjs';
import { merge, map, shareReplay, filter, take, switchMap, concatMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { createSelector } from 'reselect';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { getAllPairings } from 'selectors/pairing.selector';
import { loadPairings } from 'actions/pairing.action';
import { ProgressState } from 'models/progress-state.model';
import { loadAccounts } from 'actions/cloud-account.action';
import { getAllAccounts } from 'selectors/cloud-account.selector';
import { CloudAccount } from 'models/cloud-account.model';
import { loadBeaconAdminStatus, loadBeaconConfigStatus } from 'actions/beacon.action';
import { loadClusters, loadClustersStatuses } from 'actions/cluster.action';
import { wizardResetAllSteps, loadPolicies } from 'actions/policy.action';
import { getClustersWithBeacon } from 'selectors/cluster.selector';
import { Cluster } from 'models/cluster.model';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { PolicyService } from 'services/policy.service';
import { loadAmbariPrivileges } from 'actions/ambari.action';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { AsyncActionsService } from 'services/async-actions.service';
import { Policy } from 'models/policy.model';
import { policySelector } from 'selectors/policy.selector';
import { beaconConfigStatus } from 'selectors/beacon-config-status.selector';
import { loadBeaconCloudCreds } from 'actions/beacon-cloud-cred.action';
import { DlmPropertiesService } from 'services/dlm-properties.service';

@Component({
  selector: 'dlm-create-policy-modal',
  template: `
    <dlm-modal-dialog #createPolicyModalDialog
      [title]="modalTitle"
      [modalSize]="modalSize"
      [showFooter]="!(showMissedPolicyMessage$ | async)"
      [showOk]="!(showMissedPolicyMessage$ | async)"
      [showCancel]="false"
      [subtitleText]="'page.policies.subpage.create_policy.help_text' | translate"
      [subtitleLink]="'page.policies.subpage.create_policy.help_url' | translate"
      (onClose)="handleCloseModal()">
      <dlm-modal-dialog-body>
        <dlm-progress-container [progressState]="overallProgress$ | async">
          <div *ngIf="(overallProgress$ | async).isInProgress === false">
            <div *ngIf="(showMissedPolicyMessage$ | async); else policyExistError">
            <dlm-create-policy-wizard
              [policy]="policy$ | async"
              [accounts]="accounts$ | async"
              [clusters]="clusters$ | async"
              [pairings]="pairings$ | async"
              [sourceClusterId]="sourceClusterId"
              (onCancel)="handleOnCancel($event)"
              >
            </dlm-create-policy-wizard>
          </div>
            <ng-template #policyExistError>
              <div class="container-fluid">
                <div class="row">
                  <div class="col-lg-12">
                    <alert type="info">
                      <div>{{ 'page.policies.subpage.create_policy.policy_does_not_exist' | translate }}</div>
                    </alert>
                  </div>
                </div>
              </div>
            </ng-template>
          </div>
        </dlm-progress-container>
      </dlm-modal-dialog-body>
    </dlm-modal-dialog>
  `,
  styleUrls: ['./create-policy-modal.component.scss']
})
export class CreatePolicyModalComponent implements OnInit, OnDestroy {
  policiesQueryCount = 0;
  showMissedPolicyMessage$: Observable<boolean>;
  policy$: Observable<Policy>;
  pairings$: Observable<Pairing[]>;
  accounts$: Observable<CloudAccount[]>;
  clusters$: Observable<Cluster[]>;
  overallProgress$: Observable<ProgressState>;
  sourceClusterId: number;
  modalSize = ModalSize.FULLPAGE;
  modalTitle = 'page.policies.header_create';
  subscriptions: Subscription[] = [];
  private isEdit = false;
  @ViewChild('createPolicyModalDialog') modalDialog: ModalDialogComponent;

  constructor(
    private store: Store<State>,
    private route: ActivatedRoute,
    private router: Router,
    protected policyService: PolicyService,
    private policyWizardService: PolicyWizardService,
    private asyncActions: AsyncActionsService,
    private dlmPropertiesService: DlmPropertiesService
  ) {
  }

  private saveRouteParams(): void {
    this.isEdit = !!this.route.snapshot.params.policyId;
  }

  private getPolicySelector(policyId) {
    return createSelector(policySelector.getWithRelated(policyId), beaconConfigStatus.getAllEntities,
      (policy: Policy, beaconConfigs) => {
        if (!policy) {
          return null;
        }
        return {
        ...policy,
        targetClusterResource: {
          ...policy.targetClusterResource,
          beaconConfigStatus: policy.targetClusterResource && beaconConfigs.find(bc => bc.clusterId === policy.targetClusterResource.id),
        },
        sourceClusterResource: {
          ...policy.sourceClusterResource,
          beaconConfigStatus: policy.sourceClusterResource && beaconConfigs.find(bc => bc.clusterId === policy.sourceClusterResource.id)
        }
      };
    });
  }

  private routeBasedSetup() {
    const preselectCluster = this.route.queryParams.subscribe(queryParams => {
      if (queryParams['sourceClusterId']) {
        this.sourceClusterId = +queryParams['sourceClusterId'];
      }
    });
    const changeTitle = combineLatest(this.route.url, this.route.params).pipe(
      this.policyWizardService.whenEditMode
    ).subscribe(_ => this.modalTitle = 'page.policies.header_edit');
    this.subscriptions.push(changeTitle);
    this.subscriptions.push(preselectCluster);
  }

  private loadWizardContent() {
    const editPolicyContent = [
      () => loadPolicies({ numResults: this.policiesQueryCount || 1000, instanceCount: 0}),
      loadBeaconCloudCreds,
    ];
    const requiredContent = [
      loadPairings,
      loadAccounts,
      loadClusters,
      loadClustersStatuses,
      loadBeaconAdminStatus,
      loadBeaconConfigStatus,
      loadAmbariPrivileges,
      ...(this.isEdit ? editPolicyContent : [])
    ];
    const loadAll = (actions) => actions.map(action => this.asyncActions.dispatch(action()));
    this.overallProgress$ = of({ isInProgress: true } as ProgressState).pipe<ProgressState>(
        merge(forkJoin(loadAll(requiredContent)).pipe(
          map((progressStates: ProgressState[]) => progressStates[0]),
          filter(p => !p.isInProgress),
          shareReplay()
        ))
      );
    this.policy$ = !this.isEdit ? of(null) : this.overallProgress$.pipe(switchMap(_ =>
      this.store.select(this.getPolicySelector(decodeURIComponent(this.route.snapshot.params.policyId))).pipe(take(1))
    ));
    this.showMissedPolicyMessage$ = this.route.url.pipe(
      concatMap(url => url[0].path === 'edit' ? this.policy$.pipe(map(policy => !!policy)) : of(true))
    );
    const modalSizeChange = this.showMissedPolicyMessage$
      .subscribe(editWithPolicy => this.modalSize = editWithPolicy ? ModalSize.FULLPAGE : ModalSize.MEDIUM);
    this.subscriptions.push(modalSizeChange);
  }

  private loadQueryCount() {
    const loadQueryCount = this.dlmPropertiesService.getPoliciesQueryCount$()
      .subscribe(count => this.policiesQueryCount = count);
    this.subscriptions.push(loadQueryCount);
  }

  ngOnInit() {
    this.pairings$ = this.store.select(getAllPairings);
    this.accounts$ = this.store.select(getAllAccounts);
    this.clusters$ = this.store.select(getClustersWithBeacon);
    this.loadQueryCount();
    this.saveRouteParams();
    this.loadWizardContent();
    this.routeBasedSetup();
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
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
