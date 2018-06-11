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

import {
   Input, HostBinding, OnInit, Component, ViewEncapsulation, OnDestroy,
   OnChanges, SimpleChange, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { NotificationService } from 'services/notification.service';
import { ToastNotification } from 'models/toast-notification.model';
import { CloudAccountService } from 'services/cloud-account.service';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from 'components/forms/select-field';
import { Observable } from 'rxjs/Observable';
import {
  CREDENTIAL_TYPE_LABELS,
  S3_TYPE_VALUES,
  AWS_ACCESSKEY,
  AWS_INSTANCEPROFILE,
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
import { getUnreachableClusters } from 'selectors/unreachable-beacon.selector';
import { Cluster } from 'models/cluster.model';
import { Subscription } from 'rxjs/Subscription';

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

export class AddCloudFormComponent implements OnInit, OnChanges, OnDestroy {
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
  unreachableClusters$: Observable<Cluster[]>;
  unreachableClusters: Cluster[];
  unreachableClustersSubscription: Subscription;
  subscriptions: Subscription[] = [];

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
      authType: account.accountDetails.credentialType,
      credentialName: account.id
    };
  }

  private serializeValue(formValue: AbstractControl, validationResponse: ValidateCredentialsResponse|any = {}): AddCloudStoreRequestBody {
    const authType = formValue.get('authType').value;
    if (authType === AWS_ACCESSKEY) {
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
    } else if (authType === AWS_INSTANCEPROFILE) {
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
              private cdRef: ChangeDetectorRef) {
    this.unreachableClusters$ = store.select(getUnreachableClusters);
  }

  private trackFormInput(form: FormGroup) {
    const valueChanges$ = form.valueChanges;
    const resetErrorOnChange = valueChanges$.subscribe(v => {
      if (['secretKey', 'accessKey'].some(f => form.get(f).hasError('wrongCredentials'))) {
        this.resetErrors();
        // perform validation over new value. This will capture validation errors for required properties
        form.patchValue(v);
      }
    });
    this.subscriptions.push(resetErrorOnChange);
  }

  ngOnInit() {
    this.initForm();
    this.trackFormInput(this.addCloudForm);
    this.unreachableClusters$.subscribe(clusters => this.unreachableClusters = clusters);
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

  scrollToTop() {
      // Scroll back to the top to make the error message visible
      $('dlm-add-account-modal .modal-body').animate({scrollTop: 0}, 300);
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
        this.scrollToTop();
      }
      if (this.isValidationSuccess) {
        if (this.progress.validateCredentials.response) {
          const response = this.progress.validateCredentials.response;
          if ('accountName' in response && 'userName' in response) {
            this.addCloudForm.get('userName').setValue(response['userName']);
            this.addCloudForm.get('accountId').setValue(response['accountName']);
            // Scroll to the bottom of the modal dialog to make the footer visible
            const scrollTopValue = 2 * Math.abs(($('dlm-add-account-modal .modal-body').prop('scrollHeight') -
                $('dlm-add-account-modal .modal-body .footer-controls').offset().top));
            $('dlm-add-account-modal .modal-body').animate({scrollTop: scrollTopValue}, 300);
          } else {
            this.errorMessage = this.t.instant('common.errors.add_cloud.unexpected');
            this.scrollToTop();
          }
        } else {
          this.errorMessage = this.t.instant('common.errors.add_cloud.unexpected');
          this.scrollToTop();
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
        this.scrollToTop();
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
    return this.authType === AWS_ACCESSKEY;
  }

  get isIamRoleAuthType(): boolean {
    return this.authType === AWS_INSTANCEPROFILE;
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
    if (authType === AWS_ACCESSKEY) {
      if (this.isValidationSuccess && this.progress.validateCredentials.response) {
        this.isSaveInProgress = true;
        const requestPayload = this.serializeValue(this.addCloudForm, this.progress.validateCredentials.response);
        this.saveAccount(requestPayload);
      } else {
        this.errorMessage = this.t.instant('page.cloud_stores.content.accounts.add.invalid_form');
      }
    } else if (authType === AWS_INSTANCEPROFILE) {
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
        if (progressState.success) {
          if (this.unreachableClusters && this.unreachableClusters.length) {
            progressState.status = 200;
            progressState.success = false;
          }
          this.cloudAccountService.notifyOnCRUD(progressState, CRUD_ACTIONS.UPDATE);
        } else if (progressState.error) {
          if (progressState.errorMessage && progressState.errorMessage.length) {
            this.errorMessage = 'Update Failed: ' + progressState.errorMessage[0].error.message;
            this.scrollToTop();
          }
        }
        if (progressState.status === 200) {
          this.store.dispatch(loadAccounts(ACCOUNTS_REQUEST));
          this.cloudAccountService.closeAddAccountModal();
        }
        this.isEditButtonDisabled = false;
        this.isSaveInProgress = false;
        this.cdRef.markForCheck();
      });
  }

  ngOnDestroy() {
    if (this.unreachableClustersSubscription) {
      this.unreachableClustersSubscription.unsubscribe();
    }
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
