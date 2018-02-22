/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
import { loadContainers } from 'actions/cloud-container.action';
import { getAllContainers, getAllContainersGrouped } from 'selectors/cloud-container.selector';
import { CloudContainer } from 'models/cloud-container.model';
import { loadBeaconAdminStatus } from 'actions/beacon.action';
import { getAllBeaconAdminStatuses } from 'selectors/beacon.selector';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { loadClusters } from 'actions/cluster.action';
import { getAllClusters } from 'selectors/cluster.selector';
import { Cluster } from 'models/cluster.model';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { PolicyService } from 'services/policy.service';

const PAIR_REQUEST = '[CREATE POLICY] PAIR_REQUEST';
const CLUSTERS_REQUEST = '[CREATE POLICY] CLUSTERS_REQUEST';
const ACCOUNTS_REQUEST = '[CREATE POLICY] ACCOUNTS_REQUEST';
const CONTAINERS_REQUEST = '[CREATE POLICY] CONTAINERS_REQUEST';
const ADMIN_STATUS_REQUEST = '[CREATE POLICY] ADMIN_STATUS_REQUEST';

@Component({
  selector: 'dlm-create-policy-modal',
  template: `
    <dlm-modal-dialog #createPolicyModalDialog
      [title]="'page.policies.header_create'"
      [modalSize]="modalSize"
      [showFooter]="false"
      [showOk]="false"
      [showCancel]="false"
      (onClose)="handleCloseModal()">
      <dlm-modal-dialog-body>
        <dlm-progress-container [progressState]="overallProgress$ | async">
          <div>
            <div *ngIf="(pairings$ | async)?.length > 0; else noPairs">
              <dlm-create-policy-wizard
                [accounts]="accounts$ | async"
                [clusters]="clusters$ | async"
                [containers]="containersGrouped$ | async"
                [containersList]="containers$ | async"
                [beaconStatuses]="beaconStatuses$ | async"
                [pairings]="pairings$ | async"
                [sourceClusterId]="sourceClusterId"
                (onCancel)="handleOnCancel($event)"
                >
              </dlm-create-policy-wizard>
            </div>
            <ng-template #noPairs>
              <div>
                <div class="alert alert-warning" role="alert">
                  {{ "page.pairings.content.no_pairs" | translate}}
                  <button type="button" class="btn btn-primary" [routerLink]="'/pairings/create'">
                    {{ "page.pairings.create_button_text" | translate }}
                  </button>
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
  pairings$: Observable<Pairing[]>;
  accounts$: Observable<CloudAccount[]>;
  clusters$: Observable<Cluster[]>;
  containers$: Observable<CloudContainer[]>;
  beaconStatuses$: Observable<BeaconAdminStatus[]>;
  containersGrouped$: Observable<any>;
  overallProgress$: Observable<ProgressState>;
  loadParamsSubscription$;
  loadAccountsSubscription$;
  sourceClusterId: number;
  modalSize = ModalSize.FULLPAGE;
  @ViewChild('createPolicyModalDialog') modalDialog: ModalDialogComponent;

  constructor(private store: Store<State>, private route: ActivatedRoute, private router: Router, protected policyService: PolicyService) {
  }

  ngOnInit() {
    this.store.dispatch(loadPairings(PAIR_REQUEST));
    this.store.dispatch(loadAccounts(ACCOUNTS_REQUEST));
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST));
    this.store.dispatch(loadBeaconAdminStatus({requestId: ADMIN_STATUS_REQUEST}));
    this.pairings$ = this.store.select(getAllPairings);
    this.accounts$ = this.store.select(getAllAccounts);
    this.clusters$ = this.store.select(getAllClusters);
    this.beaconStatuses$ = this.store.select(getAllBeaconAdminStatuses);
    this.containersGrouped$ = this.store.select(getAllContainersGrouped);
    this.containers$ = this.store.select(getAllContainers);
    this.loadAccountsSubscription$ = this.accounts$.subscribe(accounts => {
      this.store.dispatch(loadContainers(accounts, CONTAINERS_REQUEST));
    });
    const progress = getMergedProgress(ACCOUNTS_REQUEST, CONTAINERS_REQUEST, PAIR_REQUEST, ADMIN_STATUS_REQUEST, CLUSTERS_REQUEST);
    this.overallProgress$ = this.store.select(progress);
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
    this.router.navigate(['/policies']);
  }

  public show() {
    this.modalDialog.show();
  }

  ngOnDestroy() {
    this.loadParamsSubscription$.unsubscribe();
    this.loadAccountsSubscription$.unsubscribe();
  }
}