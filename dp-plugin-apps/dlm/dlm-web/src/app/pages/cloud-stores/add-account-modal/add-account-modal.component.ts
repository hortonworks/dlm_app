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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dlm-add-account-modal',
  styleUrls: ['./add-account-modal.component.scss'],
  template: `
    <dlm-modal-dialog #addAccountModalDialog [title]="title" (onClose)="initForm()">
      <dlm-modal-dialog-body>
        <form class="basic-form " [formGroup]="accountForm" (ngSubmit)="handleSubmit(accountForm)">
          <dlm-form-field 
            [required]="true" 
            [maxLengthValue]="64"
            [label]="'page.cloud_stores.content.accounts.add.access_key' | translate:providerTranslate">
            <input type="password" class="form-control" qe-attr="access-key" formField formControlName="accessKey"/>
          </dlm-form-field>
          <dlm-form-field
            [required]="true"
            [maxLengthValue]="64"
            [label]="'page.cloud_stores.content.accounts.add.secret_key' | translate:providerTranslate">
            <input type="password" class="form-control" qe-attr="secret-key" formField formControlName="secretKey"/>
          </dlm-form-field>
        </form>
      </dlm-modal-dialog-body>
    </dlm-modal-dialog>
  `
})
export class AddAccountModalComponent implements OnInit, OnDestroy {
  @ViewChild('addAccountModalDialog') addAccountModalDialog: ModalDialogComponent;

  private listener$: Subscription;

  accountForm: FormGroup;

  providerTranslate: any;

  provider = '';

  get title() {
    return this.t.instant('page.cloud_stores.content.accounts.add.title', {provider: this.provider});
  }

  constructor(private t: TranslateService, private cloudAccountService: CloudAccountService, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
    // Listen for changes in the service
    this.listener$ = this.cloudAccountService.showAddAccountModal$
      .subscribe(provider => {
        if (provider) {
          this.provider = provider;
          this.providerTranslate = {provider};
          this.addAccountModalDialog.show();
        }
      });
  }

  ngOnDestroy() {
    this.listener$.unsubscribe();
  }

  public show(): void {
    this.addAccountModalDialog.show();
  }

  initForm() {
    this.accountForm = this.formBuilder.group({
      accessKey: ['', Validators.compose([Validators.required, Validators.maxLength(64)])],
      secretKey: ['', Validators.compose([Validators.required, Validators.maxLength(64)])]
    });
  }
}
