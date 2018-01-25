/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { CloudAccountService } from 'services/cloud-account.service';
import { Subscription } from 'rxjs/Subscription';
import { AddCloudFormComponent } from 'pages/cloud-stores/components/add-cloud-form/add-cloud-form.component';
import { ModalSize } from 'common/modal-dialog/modal-dialog.size';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers';
import { getCloudStoreProgress } from 'selectors/cloud-account.selector';
import { Progress } from 'models/cloud-account.model';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'dlm-add-account-modal',
  styleUrls: ['./add-account-modal.component.scss'],
  template: `
    <dlm-modal-dialog #addAccountModalDialog
      [title]=" 'page.cloud_stores.content.accounts.add.title' "
      [modalSize]="modalSize"
      [showFooter]="false"
      [showOk]="false"
      [showCancel]="false"
      (onClose)="initForm()">
      <dlm-modal-dialog-body>
        <dlm-add-cloud-form #addCloudForm
        [progress]="progress$ | async">
        </dlm-add-cloud-form>
      </dlm-modal-dialog-body>
    </dlm-modal-dialog>
  `
})
export class AddAccountModalComponent implements OnInit, OnDestroy {
  @ViewChild('addAccountModalDialog') addAccountModalDialog: ModalDialogComponent;
  @ViewChild('addCloudForm') addCloudFormComponent: AddCloudFormComponent;

  progress$: Observable<Progress>;
  private listener$: Subscription;
  modalSize = ModalSize.FIXED400;

  constructor(private t: TranslateService,
              private cloudAccountService: CloudAccountService,
              private store: Store<State>) {
  }

  ngOnInit(): void {
    // Listen for changes in the service
    this.listener$ = this.cloudAccountService.showAddAccountModal$
      .subscribe(action => {
        if (action === 'show') {
          this.addAccountModalDialog.show();
        } else if (action === 'close') {
          this.addAccountModalDialog.hide();
        }
      });
    this.progress$ = this.store.select(getCloudStoreProgress);
  }

  ngOnDestroy() {
    this.listener$.unsubscribe();
  }

  public show(): void {
    this.addAccountModalDialog.show();
  }

  initForm() {
    this.addCloudFormComponent.initForm();
  }
}
