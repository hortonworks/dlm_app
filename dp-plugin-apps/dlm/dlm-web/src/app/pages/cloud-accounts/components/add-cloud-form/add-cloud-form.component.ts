/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
   Input, HostBinding, OnInit, Component, ViewEncapsulation,
   OnChanges, SimpleChange, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { NotificationService } from 'services/notification.service';
import { ToastNotification } from 'models/toast-notification.model';
import { CloudAccountService } from 'services/cloud-account.service';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from 'components/forms/select-field';
import {
  CREDENTIAL_TYPE_LABELS,
  S3_TYPE_VALUES,
  S3_TOKEN,
  IAM_ROLE,
  CLOUD_PROVIDER_LABELS,
  CLOUD_PROVIDER_VALUES
} from 'constants/cloud.constant';
import { loadAccounts } from 'actions/cloud-account.action';
import { addCloudStore, validateCredentials, resetAddCloudProgressState, updateCloudStore } from 'actions/cloud-account.action';
import {
  AddCloudStoreRequestBody, ValidateCredentialsRequestBody,
  Progress, ValidateCredentialsResponse, CloudAccount
} from 'models/cloud-account.model';
import { PROGRESS_STATUS } from 'constants/status.constant';
import { State } from 'reducers';
import {
  FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors
} from '@angular/forms';
import { getError } from 'utils/http-util';
import { uniqValidator } from 'utils/form-util';
import { isEmpty } from 'utils/object-utils';
import { AsyncActionsService } from 'services/async-actions.service';
import { CRUD_ACTIONS } from 'constants/api.constant';

const ADD_CLOUD_FORM_REQUEST_ID = '[ADD_CLOUD_FORM] RESET_PROGRESS_REQUEST';
const ACCOUNTS_REQUEST = '[ADD_CLOUD_FORM] ACCOUNTS_REQUEST';
const VALIDATE_CREDENTIALS_KEY = 'validateCredentials';
const ADD_CLOUD_STORE_KEY = 'addCloudStore';

@Component({
  selector: 'dlm-add-cloud-form',
  templateUrl: './add-cloud-form.component.html',
  styleUrls: ['./add-cloud-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddCloudFormComponent implements OnInit, OnChanges {
  @Input() account: CloudAccount;
  @Input() progress: Progress;
  @Input() accounts: CloudAccount[] = [];
  @HostBinding('class') className = 'dlm-add-cloud-form';
  PROGRESS_STATUS = PROGRESS_STATUS;
  addCloudForm: FormGroup;
  CREDENTIAL_TYPE_LABELS = CREDENTIAL_TYPE_LABELS;
  S3_TYPE_VALUES = S3_TYPE_VALUES;
  CLOUD_PROVIDER_VALUES = CLOUD_PROVIDER_VALUES;
  CLOUD_PROVIDER_LABELS = CLOUD_PROVIDER_LABELS;
  fieldClass = 'col-xs-12';
  secretKeyInputType = 'password';
  isValidationInProgress = false;
  errorMessage = null;
  isSaveInProgress = false;
  defaultCloudProviderType = this.CLOUD_PROVIDER_VALUES[0];
  defaultCredentialType = this.S3_TYPE_VALUES[0];
  isEditButtonDisabled = false;

  cloudProviderOptions = <SelectOption[]> this.CLOUD_PROVIDER_VALUES.map(cloudProvider => {
    return {
      label: this.CLOUD_PROVIDER_LABELS[cloudProvider],
      value: cloudProvider
    };
  });

  authenticationTypeOptions = <SelectOption[]>  this.S3_TYPE_VALUES.map(credentialType => {
    return {
      label: this.CREDENTIAL_TYPE_LABELS[credentialType],
      value: credentialType
    };
  });

  private deserializeAccount(account: CloudAccount) {
    return {
      cloudProviderType: account.accountDetails.provider,
      credentialName: account.id
    };
  }

  private serializeValue(formValue: AbstractControl, validationResponse: ValidateCredentialsResponse|any = {}): AddCloudStoreRequestBody {
    const authType = formValue.get('authType').value;
    if (authType === S3_TOKEN) {
      if (validationResponse) {
        const {accountName, credentialType, userName, provider, payload} = validationResponse;
        return {
          id: formValue.get('credentialName').value.trim(),
          accountDetails: {
            provider,
            accountName,
            userName
          },
          accountCredentials: {
            credentialType,
            accessKeyId: payload.accessKeyId,
            secretAccessKey: payload.secretAccessKey
          }
        };
      }
    } else if (authType === IAM_ROLE) {
      const cloudProviderType = formValue.get('cloudProviderType').value;
      return {
        id: formValue.get('credentialName').value.trim(),
        accountDetails: {
          provider: cloudProviderType
        },
        accountCredentials: {
          credentialType: authType
        }
      };
    }
  }

  constructor(private formBuilder: FormBuilder,
              private store: Store<State>,
              private cloudAccountService: CloudAccountService,
              private notificationService: NotificationService,
              private t: TranslateService,
              private asyncActions: AsyncActionsService,
              private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.initForm();
  }

  public initForm() {
    this.store.dispatch(resetAddCloudProgressState(ADD_CLOUD_FORM_REQUEST_ID));
    const names = this.accounts.map(a => a.id);
    this.resetErrors();
    this.addCloudForm = this.formBuilder.group({
      cloudProviderType: [this.defaultCloudProviderType, Validators.required],
      credentialName: ['', Validators.compose([Validators.required, uniqValidator(names)])],
      authType: [this.defaultCredentialType, Validators.required],
      accessKey: ['', Validators.required],
      secretKey: ['', Validators.required],
      accountId: [''],
      userName: ['']
    });
    if (this.isEditMode) {
      this.addCloudForm.patchValue(this.deserializeAccount(this.account));
      this.addCloudForm.get('credentialName').disable();
      this.addCloudForm.get('cloudProviderType').disable();
    }
  }


  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['progress']) {
      if (!this.addCloudForm) {
        return;
      }
      if (this.isValidationFailure) {
        this.addCloudForm.controls['accessKey'].setErrors({'wrongCredentials': true});
        this.addCloudForm.controls['secretKey'].setErrors({'wrongCredentials': true});
        this.errorMessage = this.getErrorMessage(VALIDATE_CREDENTIALS_KEY);
      }
      if (this.isValidationSuccess) {
        if (this.progress.validateCredentials.response) {
          const response = this.progress.validateCredentials.response;
          if ('accountName' in response && 'userName' in response) {
            this.addCloudForm.get('userName').setValue(response['userName']);
            this.addCloudForm.get('accountId').setValue(response['accountName']);
          } else {
            this.errorMessage = this.t.instant('common.errors.add_cloud.unexpected');
          }
        } else {
          this.errorMessage = this.t.instant('common.errors.add_cloud.unexpected');
        }
      }
      if (this.isSaveSuccess) {
        // Close the modal dialog, fetch accounts and notify user
        this.store.dispatch(loadAccounts(ACCOUNTS_REQUEST));
        this.notificationService.create({
          type: NOTIFICATION_TYPES.SUCCESS,
          title: this.t.instant('page.cloud_stores.content.accounts.add.success_notification.title'),
          body: this.t.instant('page.cloud_stores.content.accounts.add.success_notification.body')
        } as ToastNotification);
        this.cloudAccountService.closeAddAccountModal();
      }
      if (this.isSaveFailure) {
        this.errorMessage = this.getErrorMessage(ADD_CLOUD_STORE_KEY);
      }
      if (this.progress &&
        ((this.progress.validateCredentials && this.progress.validateCredentials.state) ||
        (this.progress.addCloudStore && this.progress.addCloudStore.state))) {
        this.isValidationInProgress = false;
        this.isSaveInProgress = false;
      }
    }
  }

  get isEditMode(): boolean {
    return !isEmpty(this.account || {});
  }

  get cloudProviderType(): string {
    return this.addCloudForm.get('cloudProviderType').value;
  }

  get authType(): string {
    return this.addCloudForm.get('authType').value;
  }

  get authTypeDisabled(): boolean {
    return this.isValidationInProgress || this.isValidationSuccess;
  }

  get isS3AccessKeyAuthType(): boolean {
    return this.authType === S3_TOKEN;
  }

  get isIamRoleAuthType(): boolean {
    return this.authType === IAM_ROLE;
  }

  get isValidationFailure(): boolean {
    return this.progress && this.progress.validateCredentials && this.progress.validateCredentials.state === this.PROGRESS_STATUS.FAILED;
  }

  get isValidationSuccess(): boolean {
    return !!(this.progress && this.progress.validateCredentials &&
      this.progress.validateCredentials.state === this.PROGRESS_STATUS.SUCCESS);
  }

  get isSaveSuccess(): boolean {
    return this.progress && this.progress.addCloudStore && this.progress.addCloudStore.state === this.PROGRESS_STATUS.SUCCESS;
  }

  get isSaveFailure(): boolean {
    return this.progress && this.progress.addCloudStore && this.progress.addCloudStore.state === this.PROGRESS_STATUS.FAILED;
  }

  get isSaveButtonDisabled(): boolean {
    return this.isSaveInProgress || this.addCloudForm.get('credentialName').invalid ||
      (this.addCloudForm.invalid && !this.isIamRoleAuthType);
  }

  get canValidate(): boolean {
    return this.addCloudForm.valid;
  }

  isInputDisabled() {
    // Returning null to [disabled] attribute will remove it
    // Having disabled="false" doesn't work as expected. The element is still disabled because disabled itself is a boolean attribute
    const bool = this.isValidationInProgress || this.isValidationSuccess;
    return bool ? bool : null;
  }

  getErrorMessage(progressId): string {
    return getError(this.progress[progressId]['response']['error']).message;
  }

  resetErrors() {
    this.errorMessage = null;
    if (this.addCloudForm) {
      this.addCloudForm.controls['accessKey'].setErrors(null);
      this.addCloudForm.controls['secretKey'].setErrors(null);
      this.addCloudForm.controls['credentialName'].setErrors(null);
    }
  }

  cancelButtonHandler() {
    this.initForm();
    this.cloudAccountService.closeAddAccountModal();
  }

  saveButtonHandler() {
    this.resetErrors();
    const authType = this.addCloudForm.get('authType').value;
    if (authType === S3_TOKEN) {
      if (this.isValidationSuccess && this.progress.validateCredentials.response) {
        this.isSaveInProgress = true;
        const requestPayload = this.serializeValue(this.addCloudForm, this.progress.validateCredentials.response);
        this.saveAccount(requestPayload);
      } else {
        this.errorMessage = this.t.instant('page.cloud_stores.content.accounts.add.invalid_form');
      }
    } else if (authType === IAM_ROLE) {
      this.isSaveInProgress = true;
      const requestPayload = this.serializeValue(this.addCloudForm);
      this.saveAccount(requestPayload);
    }
  }

  saveAccount(requestPayload: AddCloudStoreRequestBody): void {
    if (this.isEditMode) {
      this.updateAccount(requestPayload);
    } else {
      this.store.dispatch(addCloudStore(requestPayload, {}));
    }
  }

  validateButtonHandler(addCloudForm) {
    this.resetErrors();
    this.isValidationInProgress = true;
    const {value} = addCloudForm;
    const requestPayload: ValidateCredentialsRequestBody = {
      credentialType: value.authType,
      accessKeyId: value.accessKey,
      secretAccessKey: value.secretKey
    };
    this.store.dispatch(validateCredentials(requestPayload, {}));
  }

  toggleSecretKeyInputType() {
    this.secretKeyInputType = this.secretKeyInputType === 'password' ? 'text' : 'password';
  }

  updateAccount(requestPayload: AddCloudStoreRequestBody): void {
    this.isEditButtonDisabled = true;
    this.asyncActions.dispatch(updateCloudStore(requestPayload))
      .subscribe(progressState => {
        this.cloudAccountService.notifyOnCRUD(progressState, CRUD_ACTIONS.UPDATE);
        if (progressState.status === 200) {
          this.cloudAccountService.closeAddAccountModal();
        }
        this.isEditButtonDisabled = false;
        this.isSaveInProgress = false;
        this.cdRef.markForCheck();
      });
  }
}
