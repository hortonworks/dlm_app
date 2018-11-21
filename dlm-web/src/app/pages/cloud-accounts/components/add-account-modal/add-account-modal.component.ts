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


import {pluck} from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { CloudAccountService } from 'services/cloud-account.service';
import { Observable, Subscription ,   } from 'rxjs';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { Store } from '@ngrx/store';
import { State } from 'reducers';
import { getAllAccounts, getCloudStoreProgress } from 'selectors/cloud-account.selector';
import { CloudAccount, Progress } from 'models/cloud-account.model';
import { loadAccounts } from 'actions/cloud-account.action';
import { AddAccountModalActions, AddAccountModalState } from 'pages/cloud-accounts/components/add-account-modal/add-account-modal.type';
import { isEmpty } from 'utils/object-utils';
import { AddCloudFormComponent } from 'pages/cloud-accounts/components/add-cloud-form/add-cloud-form.component';

@Component({
  selector: 'dlm-add-account-modal',
  styleUrls: ['./add-account-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dlm-modal-dialog #addAccountModalDialog
      [title]="title"
      [modalSize]="modalSize"
      [showFooter]="false"
      [showOk]="false"
      [showCancel]="false"
      (onClose)="onClose()">
      <dlm-modal-dialog-body *ngIf="isShown">
        <dlm-add-cloud-form
          #addCloudForm
          [account]="account$ | async"
          [accounts]="accounts$ | async"
          [progress]="progress$ | async">
        </dlm-add-cloud-form>
      </dlm-modal-dialog-body>
    </dlm-modal-dialog>
  `
})
export class AddAccountModalComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  @ViewChild('addAccountModalDialog') addAccountModalDialog: ModalDialogComponent;
  @ViewChild('addCloudForm') addCloudForm: AddCloudFormComponent;

  account$: Observable<CloudAccount>;
  progress$: Observable<Progress>;
  accounts$: Observable<CloudAccount[]>;
  modalSize = ModalSize.FIXED400;
  isShown = false;
  title = 'page.cloud_stores.content.accounts.add.title';

  constructor(private cloudAccountService: CloudAccountService,
              private cdRef: ChangeDetectorRef,
              private store: Store<State>) {
  }

  ngOnInit(): void {
    // Listen for changes in the service
    this.store.dispatch(loadAccounts());
    this.accounts$ = this.store.select(getAllAccounts);
    this.account$ = this.cloudAccountService.addAccountModalState$.asObservable().pipe(
      pluck<AddAccountModalState, CloudAccount>('account'));
    const modalState$ = this.cloudAccountService.addAccountModalState$;
    const updateModalVisibility = modalState$
      .subscribe(nextState => {
        const { action } = nextState;
        if (action === AddAccountModalActions.SHOW) {
          this.show();
        } else if (action === AddAccountModalActions.HIDE) {
          this.hide();
        }
      });
    const updateModalTitle = modalState$.subscribe(nextState => {
      const { account } = nextState;
      this.title = isEmpty(account || {}) ? 'page.cloud_stores.content.accounts.add.title' :
        'page.cloud_stores.content.accounts.update.title';
    });
    this.progress$ = this.store.select(getCloudStoreProgress);
    this.subscriptions.push(updateModalVisibility);
    this.subscriptions.push(updateModalTitle);
    this.cdRef.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s && s.unsubscribe());
    this.cdRef.detach();
  }

  public show(): void {
    this.addAccountModalDialog.show();
    this.isShown = true;
    this.cdRef.detectChanges();
  }

  public hide(): void {
    this.isShown = false;
    this.addAccountModalDialog.hide();
  }

  public onClose() {
    this.isShown = false;
  }
}
