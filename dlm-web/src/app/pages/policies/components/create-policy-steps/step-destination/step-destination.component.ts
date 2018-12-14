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


import {of as observableOf,  Observable, Subscription } from 'rxjs';

import {take, distinctUntilChanged, debounceTime, switchMap, tap, map} from 'rxjs/operators';
import {
  Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { CloudContainer } from 'models/cloud-container.model';
import { CloudAccount, HttpProgress } from 'models/cloud-account.model';
import { SourceValue, StepGeneralValue, DestinationValue, StepDestinationValue } from 'models/create-policy-form.model';
import { Cluster } from 'models/cluster.model';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import {
  FormGroup, Validators, FormBuilder, AbstractControl,
  ValidatorFn, ValidationErrors
} from '@angular/forms';
import {
  POLICY_TYPES, WIZARD_STEP_ID, SOURCE_TYPES, SOURCE_TYPES_LABELS,
  TDE_KEY_TYPE, TDE_KEY_LABEL, AWS_ENCRYPTION, AWS_ENCRYPTION_LABELS, AWS_CLUSTER_ENCRYPTION
} from 'constants/policy.constant';
import { getSteps } from 'selectors/create-policy.selector';
import { TranslateService } from '@ngx-translate/core';
import { mapToList } from 'utils/store-util';
import { getClusterEntities, clusterToListOption, addCloudPrefix,
  isOptionDisabled, getTooltip, dropdownClickHandler } from 'utils/policy-util';
import { validatePolicy } from 'actions/policy.action';
import { multiLevelResolve, omitEmpty, isEmpty, isEqual } from 'utils/object-utils';
import { getPolicyValidationProgress } from 'selectors/create-policy.selector';
import { PROGRESS_STATUS } from 'constants/status.constant';
import { PolicyService } from 'services/policy.service';
import { contains, without } from 'utils/array-util';
import { HdfsService } from 'services/hdfs.service';
import { HiveService } from 'services/hive.service';
import { AsyncActionsService } from 'services/async-actions.service';
import { RadioItem } from 'common/radio-button/radio-button';
import { loadDatabases } from 'actions/hivelist.action';
import { filterClustersByTDE, filterClustersByHdfsCloud,
  filterClustersByHdfsWasbCloud, filterClustersByHdfsGcsCloud } from 'utils/cluster-util';
import { UnderlyingFsForHive } from 'models/beacon-config-status.model';
import { SelectOption } from 'components/forms/select-field';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { EncryptedResource } from 'models/encryption.model';
import { markAllPristine, hiveDBNameValidator } from 'utils/form-util';
import { SpinnerSize } from 'common/spinner';
import { NOTIFICATION_CONTENT_TYPE, NOTIFICATION_TYPES } from 'constants/notification.constant';

export function validationStatusValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const validationStatus = multiLevelResolve(control, 'controls.validationStatus.value');
    const skipValidation = multiLevelResolve(control, 'controls.skipValidation.value');
    if (skipValidation) {
      return null;
    }
    return validationStatus ? null : {validationsStatus: {name: validationStatus}};
  };
}

@Component({
  selector: 'dlm-step-destination',
  templateUrl: './step-destination.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./step-destination.component.scss']
})
export class StepDestinationComponent implements OnInit, OnDestroy, StepComponent {

  @Input() pairings: Pairing[] = [];
  @Input() containers: any = {};
  @Input() accounts: CloudAccount[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() containersList: CloudContainer[] = [];
  subscriptions: Subscription[] = [];
  @Output() onFormValidityChange = new EventEmitter<boolean>();
  @HostBinding('class') className = 'dlm-step-destination';

  readonly stepId = WIZARD_STEP_ID.DESTINATION;
  validationResults: HttpProgress;
  validationInProgress = false;
  form: FormGroup;
  source: SourceValue = {} as SourceValue;
  general: StepGeneralValue = {} as StepGeneralValue;
  WIZARD_STEP_ID = WIZARD_STEP_ID;
  POLICY_TYPES = POLICY_TYPES;
  SOURCE_TYPES = SOURCE_TYPES;
  SOURCE_TYPES_LABELS = SOURCE_TYPES_LABELS;

  getTooltip = getTooltip.bind(this, this.t);
  isOptionDisabled = isOptionDisabled;
  dropdownClickHandler = dropdownClickHandler;
  spinnerSize = SpinnerSize;

  loadedResourceMap = {
    databases: {}
  };

  prevFormValue: any = {destination: {}};

  /**
   * List of field-names related to cluster (source or destination)
   *
   * @type {string[]}
   */
  clusterFields = ['cluster', 'path'];

  /**
   * List of field-names related to cloud (source or destination)
   *
   * @type {string[]}
   */
  s3Fields = ['cloudAccount', 's3endpoint', 'cloudEncryption', 'cloudEncryptionKey'];

  wasbFields = ['cloudAccount', 's3endpoint'];

  private initialFormValue: StepDestinationValue;

  get validationFailType() {
    return this.validationResults && this.validationResults.response['error'].status === 412 ? 'warning' : 'error';
  }

  get formIsFilled(): boolean {
    if (this.isCloudType) {
      return this.isCloudAccountSelected && this.form.get('destination.s3endpoint').value;
    }
    if (this.isHivePolicy && this.isCloudReplication) {
      return this.isClusterSelected && this.form.get('destination.path').valid && this.isCloudAccountSelected;
    }
    return this.isClusterSelected && this.form.get('destination.path').valid;
  }

  get selectedCluster(): Cluster {
    return this.clusters.find(cluster => cluster.id === +this.form.get('destination.cluster').value);
  }

  get isHdfsPolicy(): boolean {
    return this.general.type === POLICY_TYPES.HDFS;
  }

  get isHivePolicy(): boolean {
    return this.general.type === POLICY_TYPES.HIVE;
  }

  get isHiveOnPremReplication(): boolean {
    return this.isClusterSelected && this.checkHiveOnPrem(this.selectedCluster.id);
  }

  get hiveCloudWareHouseFs(): UnderlyingFsForHive {
    const cluster = this.clusters.find(c => c.id === +this.selectedCluster.id);
    return (cluster && cluster.beaconConfigStatus &&
      cluster.beaconConfigStatus.underlyingFsForHive) || UnderlyingFsForHive.S3;
  }

  get destinationType() {
    return this.form.value.destination.type;
  }

  private filterCloudAccounts(provider) {
    return this.accounts
      .filter(a => a.accountDetails.provider === provider)
      .map(a => ({label: a.id, value: a.id}));
  }

  get validationMessage() {
    const result = this.validationResults;
    const defaultMsg = this.t.instant('page.policies.form.fields.destinationCluster.validationFailed');
    if (result.state === PROGRESS_STATUS.FAILED) {
      try {
        const json = multiLevelResolve(result, 'response.error.error.message').replace('Failed with ', '');
        return JSON.parse(json).error.message;
      } catch (e) {
        const sourceIsWasb = this.source.type === SOURCE_TYPES.WASB;
        const destinationIsWasb = this.form.get('destination.type').value === SOURCE_TYPES.WASB;
        if (sourceIsWasb || destinationIsWasb) {
          const name = sourceIsWasb ? this.source.cloudAccount : this.form.get('destination.cloudAccount').value;
          return this.t.instant('page.policies.form.fields.destinationCluster.wasbValidationFailed', {name});
        }
        return defaultMsg;
      }
    }
    return '';
  }

  get destinationCloudAccounts() {
    const cloudFsType = this.isHivePolicy ? this.SOURCE_TYPES[this.hiveCloudWareHouseFs] : this.destinationType;
    return this.filterCloudAccounts(cloudFsType);
  }

  get isCloudReplication(): boolean {
    return contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB, SOURCE_TYPES.GCS], this.form.get('destination.type').value) ||
      (this.isHivePolicy && this.selectedCluster && !this.isHiveOnPremReplication);
  }

  get isS3CloudReplication(): boolean {
    return (this.form.get('destination.type').value === SOURCE_TYPES.S3) ||
      (this.isHivePolicy && this.selectedCluster && !this.isHiveOnPremReplication);
  }

  get isHiveCloudNotEncrypted(): boolean {
    return this.isHivePolicy && this.isCloudReplication &&
      this.form.get('destination.cloudEncryption').value === 'None';
  }

  /**
   * Check if either source or destination dataset is a cloud resource
   * For now this is possible for HDFS policy where dataset can be s3 path
   * @returns {boolean}
   */
  get isCloudInvolvedForHDFS(): boolean {
    return this.form.get('destination.type').value === SOURCE_TYPES.S3 || this.source.type === SOURCE_TYPES.S3;
  }

  get isClusterType(): boolean {
    return this.destinationType === SOURCE_TYPES.CLUSTER;
  }

  get isSourceClusterType(): boolean {
    return this.source.type === SOURCE_TYPES.CLUSTER;
  }

  /**
   * Returns if the selected cluster is running Beacon v1.0
   * @returns {boolean}
   */
  get isDestination10(): boolean {
    const cluster = this.clusters.find(c => c.id === this.form.get('destination.cluster').value);
    if (cluster && cluster.beaconAdminStatus) {
      const {beaconAdminStatus: {is10}} = cluster.beaconAdminStatus;
      return is10;
    }
    return true;
  }

  get isCloudType(): boolean {
    return contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB, SOURCE_TYPES.GCS], this.destinationType);
  }

  get isClusterSelected(): boolean {
    return this.form.get('destination.cluster').value !== '';
  }

  get isCloudAccountSelected(): boolean {
    return !!this.form.get('destination.cloudAccount').value;
  }

  get destinationClusters() {
    const sourceType = this.source.type;
    if (sourceType === SOURCE_TYPES.CLUSTER) {
      if (this.source.cluster) {

        const pairings = this.pairings.filter(pairing => contains([+pairing.cluster1.id, +pairing.cluster2.id], +this.source.cluster));
        if (pairings.length) {
          const clusterEntities = getClusterEntities(pairings, this.clusters);
          // Remove source cluster from the entities
          delete clusterEntities[this.source.cluster];
          return mapToList(clusterEntities);
        }
        return [{
          label: {
            display: this.t.instant('page.policies.form.fields.destinationCluster.noPair')
          },
          value: ''
        }];
      }
      return [{
        label: {
          display: this.t.instant('page.policies.form.fields.destinationCluster.default')
        },
        value: ''
      }];
    } else if (sourceType === SOURCE_TYPES.WASB) {
      return filterClustersByTDE(filterClustersByHdfsWasbCloud(this.clusters)).map(cluster => clusterToListOption(cluster));
    } else {
      return filterClustersByTDE(filterClustersByHdfsCloud(this.clusters)).map(cluster => clusterToListOption(cluster));
    }
  }

  /**
   * List of Destination Type options
   * Only Cluster can be a Destination for HIVE Policy
   * Only Cluster can be a Destination for Cloud Source
   * If Source Cluster has `replicationCloudFS` set to `true` both Cluster and Cloud may be a Destination,
   * otherwise only Cluster can be used
   *
   * @type {{label: string, value: string}}[]
   */
  get destinationTypes() {
    const sourceClusterId = this.source.cluster;
    const makeOption = (sourceType: SOURCE_TYPES): {label: string, value: SOURCE_TYPES} =>
      ({label: this.SOURCE_TYPES_LABELS[sourceType], value: sourceType});
    const onlyCluster = [makeOption(SOURCE_TYPES.CLUSTER)];

    if (this.general.type === POLICY_TYPES.HIVE || contains([SOURCE_TYPES.S3, SOURCE_TYPES.WASB,
      SOURCE_TYPES.GCS], this.source.type)) {
      return onlyCluster;
    }

    const sourceClusterFilters = {
      [SOURCE_TYPES.S3]: filterClustersByHdfsCloud,
      [SOURCE_TYPES.WASB]: filterClustersByHdfsWasbCloud,
      [SOURCE_TYPES.GCS]: filterClustersByHdfsGcsCloud
    };
    const reducer = (accumulator: {label: string, value: SOURCE_TYPES}[] , currentValue: SOURCE_TYPES) => {
      const sourceFilter = sourceClusterFilters[currentValue];
      if (sourceFilter(this.clusters).some(c => c.id === sourceClusterId)) {
        return [...accumulator, makeOption(currentValue)];
      }
      return accumulator;
    };
    return Object.keys(sourceClusterFilters).reduce(reducer, onlyCluster);
  }

  get tdeOptions(): RadioItem[] {
    return [
      {value: TDE_KEY_TYPE.DIFFERENT_KEY, label: this.t.instant(TDE_KEY_LABEL.DIFFERENT_KEY)},
      {value: TDE_KEY_TYPE.SAME_KEY, label: this.t.instant(TDE_KEY_LABEL.SAME_KEY)},
    ];
  }

  get destinationPathLabel(): string {
    const label = this.general.type === POLICY_TYPES.HDFS ? 'directory' : 'database';
    return this.t.instant(`page.policies.form.fields.destinationCluster.${label}`);
  }

  get destCloudPathPlaceHolder() {
    return  this.destinationType === SOURCE_TYPES.WASB ?
      this.t.instant('page.policies.form.fields.wasb.endpointPlaceholder') :
      this.t.instant('page.policies.form.fields.s3.endpointPlaceholder');
  }

  get destinationPathDisabled(): boolean {
    if (!this.isSourceClusterType || this.isHivePolicy && !this.isHiveOnPremReplication) {
      return false;
    }
    const sourceCluster = this.clusters.find(c => c.id === this.source.cluster);
    return !this.wizardService.supportsDifferentDestinationPath(sourceCluster);
  }

  get shouldShowTDEWarning(): boolean {
    return this.shouldShowTDEKey && this.form.get('destination.tdeKey').value === TDE_KEY_TYPE.SAME_KEY;
  }

  get shouldShowTDEKey(): boolean {
    if (this.isSourceEncrypted && this.isClusterType && this.isSourceClusterType) {
      return this.isHdfsPolicy || this.isHiveOnPremReplication;
    }
    return false;
  }

  get shouldShowS3Endpoint(): boolean {
    if (this.shouldPrepopulateHivePath) {
      return this.isCloudReplication && this.form.get('destination.cluster').value;
    }
    return this.isCloudReplication && this.form.get('destination.cloudAccount').value;
  }

  get shouldPrepopulateHivePath(): boolean {
    return this.isHivePolicy && !this.isHiveOnPremReplication;
  }

  get shouldShowDestination(): boolean {
    return this.isClusterType && this.isClusterSelected;
  }

  get shouldShowEncryptionKey(): boolean {
    const isHiveCloudKmsReplication = this.isHivePolicy && this.isS3CloudReplication &&
      this.form.get('destination.cloudEncryption').value === AWS_ENCRYPTION_LABELS[AWS_ENCRYPTION.SSE_KMS];
    const isHDFSToCloudKmsReplication = this.isS3CloudReplication &&
      this.form.get('destination.cloudEncryption').value === AWS_ENCRYPTION.SSE_KMS;
    return isHiveCloudKmsReplication || isHDFSToCloudKmsReplication;
  }

  get isSourceEncrypted(): boolean {
    return this.source.datasetEncrypted || this.source.type === SOURCE_TYPES.S3 && this.source.cloudEncryption !== null;
  }

  get cloudEncryptionOptions(): SelectOption[] {
    const sourceType = SOURCE_TYPES.S3;
    const makeOption = (value, label): SelectOption => ({label, value});
    const none: SelectOption = {value: null, label: 'None'};
    const optionsMap: {[sourceType: string]: SelectOption[]} = {
      [SOURCE_TYPES.S3]: [
        makeOption(AWS_ENCRYPTION.SSE_S3, AWS_ENCRYPTION_LABELS[AWS_ENCRYPTION.SSE_S3]),
        makeOption(AWS_ENCRYPTION.SSE_KMS, AWS_ENCRYPTION_LABELS[AWS_ENCRYPTION.SSE_KMS])
      ]
    };
    return [].concat.apply(this.isSourceEncrypted ? [] : [none], !this.isCloudReplication ? [] : optionsMap[sourceType] || []);
  }

  constructor(
    private store: Store<State>,
    private formBuilder: FormBuilder,
    private t: TranslateService,
    private hdfsService: HdfsService,
    private hiveService: HiveService,
    private asyncActions: AsyncActionsService,
    private cdRef: ChangeDetectorRef,
    private wizardService: PolicyWizardService
  ) {
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      destination: this.formBuilder.group({
        type: ['', Validators.required],
        cluster: ['', Validators.required],
        cloudAccount: ['', Validators.required],
        s3endpoint: ['', Validators.required],
        path: ['', Validators.required, this.pathValidator.bind(this) ],
        tdeKey: [TDE_KEY_TYPE.DIFFERENT_KEY],
        cloudEncryption: [null],
        cloudEncryptionKey: [null, Validators.required],
        skipValidation: [false],
        validationStatus: [false],
        validationPerformed: [false]
      })
    });
  }

  private disableFields(fields: string[]): void {
    fields.forEach(f => this.form.get('destination').get(f).disable());
  }

  private enableFields(fields: string[]): void {
    fields.forEach(f => this.form.get('destination').get(f).enable());
  }

  /**
   * Reset destination form group if Source Type is changed
   * Reset other fields in the Source form group
   * Enable `directories`-field for Cluster and disable it for Cloud
   */
  private subscribeToDestinationType() {
    const destinationControls = this.form.controls.destination['controls'];
    const subscription = destinationControls.type.valueChanges.subscribe(type => {
      let toEnable = [], toDisable = [];
      if (type === SOURCE_TYPES.S3) {
        toEnable = without(this.s3Fields, 'cloudEncryptionKey');
        toDisable = this.clusterFields;
      } else if (contains([SOURCE_TYPES.WASB, SOURCE_TYPES.GCS], type)) {
        toEnable = this.wasbFields;
        toDisable = this.clusterFields.concat(without(this.s3Fields, this.wasbFields));
      } else if (type === SOURCE_TYPES.CLUSTER) {
        toEnable = this.clusterFields;
        toDisable = this.s3Fields;
      }
      this.enableFields(toEnable);
      this.disableFields(toDisable);
    });
    this.subscriptions.push(subscription);
  }


  private subscribeToCluster(form: FormGroup): void {
    const clusterChange$ = form.get('destination.cluster').valueChanges.pipe(distinctUntilChanged());
    const updateHiveFieldsAccess = clusterChange$.subscribe(value => {
      if (this.form.get('destination.cluster').disabled) {
        return;
      }
      const selectedCluster = this.clusters.find(c => c.id === +value);
      if (this.isHivePolicy) {
        if (!this.checkHiveOnPrem(value)) {
          this.enableFields(['path'].concat(this.s3Fields));
          if (selectedCluster) {
            const configs = multiLevelResolve(selectedCluster, 'beaconConfigStatus.configs') || {};
            const s3Dir = configs['hive.metastore.warehouse.dir'];
            const cloudEncryption = configs['hive.cloud.encryptionAlgorithm'];
            const cloudEncryptionKey = configs['hive.cloud.encryptionKey'];
            if (s3Dir) {
              const matched = s3Dir.match(/:\/\/(.+)/);
              form.patchValue({ destination: {
                s3endpoint: matched && matched[1] || ''
              }});
            }
            form.patchValue({ destination: {
                cloudEncryption: AWS_ENCRYPTION_LABELS[AWS_CLUSTER_ENCRYPTION[cloudEncryption] || ''] || 'None'
              }});
            this.disableFields(['cloudEncryption']);

            if (cloudEncryptionKey) {
              form.patchValue({ destination: {
                  cloudEncryptionKey
                }});
              this.disableFields(['cloudEncryptionKey']);
            }
          }
        } else {
          this.disableFields(this.s3Fields);
        }
        return;
      }
      if (this.isCloudReplication) {
        this.disableFields(['path']);
        if (this.isS3CloudReplication) {
          this.enableFields(without(this.s3Fields, 'cloudEncryptionKey'));
        } else {
          this.enableFields(this.wasbFields);
        }
      } else {
        this.enableFields(['path']);
        this.disableFields(this.s3Fields);
      }
      // Dynamically add or remove validationStatusValidator based on Beacon version
      if (selectedCluster) {
        const {beaconAdminStatus: {is10}} = selectedCluster.beaconAdminStatus;
        const destinationControl = form.get('destination');
        if (is10) {
          destinationControl.clearValidators();
          destinationControl.updateValueAndValidity();
        } else {
          destinationControl.setValidators(validationStatusValidator());
          form.patchValue({
            destination: {
              validationPerformed: false,
              validationStatus: false
            }
          });
          destinationControl.updateValueAndValidity();
        }
      }
    });
    this.subscriptions.push(updateHiveFieldsAccess);
  }

  private subscribeToCloudEncryption(form: FormGroup): void {
    const cloudEncryptionChanges$: Observable<AWS_ENCRYPTION> = form.get('destination.cloudEncryption')
    .valueChanges.pipe(distinctUntilChanged());
    const updateEncryptionKeyAccess = cloudEncryptionChanges$.subscribe(value => {
      if (this.isHivePolicy && this.isCloudReplication) {
        form.get('destination.cloudEncryptionKey').disable();
      } else if (value === AWS_ENCRYPTION.SSE_KMS) {
        form.get('destination.cloudEncryptionKey').enable();
      } else {
        form.get('destination.cloudEncryptionKey').disable();
      }
    });
    this.subscriptions.push(updateEncryptionKeyAccess);
  }

  private subscribeToCloudAccount(form: FormGroup): void {
    const cloudAccountChange$ = form.get('destination.cloudAccount').valueChanges.pipe(distinctUntilChanged());
    const presetCloudEncryption = cloudAccountChange$.subscribe(value => {
      if (value && this.isSourceEncrypted && !form.get('destination.cloudEncryption').value) {
        form.patchValue({
          destination: {
            cloudEncryption: AWS_ENCRYPTION.SSE_S3
          }
        });
      }
    });
    this.subscriptions.push(presetCloudEncryption);
  }

  private trackValidationResult(form: FormGroup): void {
    const validationSubscription = this.store.select(getPolicyValidationProgress)
      .subscribe(validationResults => {
        this.validationResults = validationResults;
        this.validationInProgress = false;
        if (validationResults.state) {
          form.patchValue({
            destination: {
              validationPerformed: true,
              validationStatus: validationResults.state === PROGRESS_STATUS.SUCCESS
            }
          });
        }
        this.cdRef.markForCheck();
      });
    this.subscriptions.push(validationSubscription);
  }

  private adjustFormValue(form: FormGroup): void {
    const prevStepsSubscription = this.store.select(getSteps(WIZARD_STEP_ID.GENERAL, WIZARD_STEP_ID.SOURCE, WIZARD_STEP_ID.DESTINATION))
      .subscribe(([general, source]) => {
        const sourcePristine = !isEmpty(source.value || {}) && isEqual(source.value.source, this.source || {});
        if (!isEmpty(this.source || {}) && !isEmpty(source.value || {})) {
          const sourceTypeChanged = this.source.type !== source.value.source.type;
          const policyTypeChanged = this.general.type !== general.value.type;
          if (sourceTypeChanged || policyTypeChanged) {
            form.patchValue(this.initialFormValue);
            markAllPristine(form);
          }
        }
        this.general = general.value || {};
        this.source = source.value && source.value.source || {};
        const currentPathValue = form.get('destination.path').value;
        if (this.source.type === SOURCE_TYPES.CLUSTER) {
          const sourcePath = this.general.type === POLICY_TYPES.HDFS ?
            this.source.directories : this.source.databases;
          // do not update path value when next conditions accepted:
          // - source form wasn't changed
          // - destination path is not empty (was set before)
          // - destination path value is not the same as source path value
          // it's done for saving path value on transition from schedule step
          if (sourcePristine && currentPathValue && currentPathValue !== sourcePath) {
            return;
          }
          form.patchValue({
            destination: {
              path: sourcePath
            }
          });
        } else {
          // do not reset path value when source is cloud and source form wasn't changed
          if (sourcePristine && currentPathValue) {
            return;
          }
          form.patchValue({destination: {path: ''}});
        }
      });
    this.subscriptions.push(prevStepsSubscription);
  }

  ngOnInit() {
    this.form = this.initForm();
    this.initialFormValue = this.form.getRawValue();
    this.subscriptions.push(this.wizardService.publishValidationStatus(this, this.form));
    this.trackValidationResult(this.form);
    this.adjustFormValue(this.form);
    this.subscriptions.push(this.form.valueChanges.subscribe(value => {
      const policyFieldsUpdated = this.policyFieldsUpdated(value);
      this.prevFormValue = value;
      if (policyFieldsUpdated) {
        this.form.patchValue({
          destination: {
            validationStatus: false,
            validationPerformed: false
          }
        });
      }
    }));
    this.subscribeToDestinationType();
    this.subscribeToCluster(this.form);
    this.subscribeToCloudAccount(this.form);
    this.subscribeToCloudEncryption(this.form);
  }

  policyFieldsUpdated(currentFormValue): boolean {
    return !![...this.s3Fields, ...this.clusterFields].find(f => this.prevFormValue.destination[f] !== currentFormValue.destination[f]);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  checkHiveOnPrem(clusterId): boolean {
    const cluster = this.clusters.find(c => c.id === +clusterId);
    return cluster && cluster.beaconConfigStatus &&
      cluster.beaconConfigStatus.underlyingFsForHive === UnderlyingFsForHive.HDFS;
  }

  isFormValid() {
    const validationStatus = this.form.get('destination.validationStatus').value;
    const skipValidation = this.form.get('destination.skipValidation').value;
    if (skipValidation || (this.isDestination10 && !this.isCloudType)) {
      return this.form.valid;
    }
    if (this.form.valid) {
      return validationStatus;
    }
    return false;
  }

  getFormValue() {
    return this.form.value;
  }

  validate() {
    const form = this.form;
    this.validationInProgress = true;
    let sourceDataset = this.source.type === SOURCE_TYPES.CLUSTER ?
      this.source.directories : addCloudPrefix(this.source.s3endpoint, this.source.type);
    if (this.isHivePolicy) {
      sourceDataset = this.source.databases;
    }
    const requestData: any = {
      type: this.general.type,
      policyName: this.general.name,
      cloudCred: this.source.cloudAccount || form.get('destination.cloudAccount').value,
      targetDataset: this.destinationType === SOURCE_TYPES.CLUSTER ? form.get('destination.path').value :
        addCloudPrefix(form.get('destination.s3endpoint').value, this.destinationType),
      sourceDataset
    };
    const sourceCluster = this.clusters.find(c => c.id === this.source.cluster);
    let sourceClusterId = '';
    if (sourceCluster) {
      sourceClusterId = PolicyService.makeClusterId(sourceCluster.dataCenter, sourceCluster.name);
      requestData.idForUrl = sourceCluster.id;
      requestData.sourceCluster = sourceClusterId;
    }
    const targetCluster = this.clusters.find(c => c.id === form.get('destination.cluster').value);
    let targetClusterId = '';
    if (targetCluster && form.get('destination.type').value === SOURCE_TYPES.CLUSTER) {
      targetClusterId = PolicyService.makeClusterId(targetCluster.dataCenter, targetCluster.name);
      requestData.idForUrl = targetCluster.id;
      requestData.targetCluster = targetClusterId;
    }
    if (this.source.type === SOURCE_TYPES.CLUSTER) {
      if (this.isHdfsPolicy) {
        requestData.enableSnapshotBasedReplication = this.source.enableSnapshotBasedReplication;
        if (this.isCloudInvolvedForHDFS) {
          const encryptionTarget: DestinationValue = form.get('destination').value;
          requestData['cloud.encryptionAlgorithm'] = encryptionTarget.cloudEncryption;
          requestData['cloud.encryptionKey'] = encryptionTarget.cloudEncryptionKey;
        }
      }
    } else {
      const encryptionTarget: SourceValue = this.source;
      requestData['cloud.encryptionAlgorithm'] = encryptionTarget.cloudEncryption;
    }
    if (this.isHivePolicy && !this.isHiveOnPremReplication) {
      requestData.idForUrl = sourceCluster.id;
    }
    this.store.dispatch(validatePolicy(omitEmpty(requestData), {}));
  }

  private pathValidator(control: AbstractControl) {
    const extractError = (resource = {} as EncryptedResource) => {
      return resource.isEncrypted ? null : { encryption: true };
    };
    const noErrors = observableOf(null);
    const cluster = this.form.get('destination.cluster').value;
    const type = this.form.get('destination.type').value;
    const dbNameValidation = hiveDBNameValidator()(control);
    const isHiveTDEOnPrem = this.isSourceEncrypted && this.isHivePolicy && this.isHiveOnPremReplication;
    if (this.isHivePolicy && dbNameValidation !== null) {
      return observableOf(dbNameValidation);
    }
    if (!this.isSourceEncrypted || !cluster || type === SOURCE_TYPES.S3 || isHiveTDEOnPrem) {
      return noErrors;
    }
    if (!control.valueChanges) {
      return noErrors;
    }
    return control.valueChanges.pipe(debounceTime(500), switchMap(path => {
      if (this.general.type === POLICY_TYPES.HDFS) {
        return this.hdfsService.checkFileEncryption(cluster, path).pipe(
          map(extractError));
      } else if (this.general.type === POLICY_TYPES.HIVE && this.isHiveOnPremReplication) {
        if (!this.loadedResourceMap.databases[cluster]) {
          return this.asyncActions.dispatch(loadDatabases(cluster, {
            notification: {
              [NOTIFICATION_TYPES.ERROR]: {
                title: this.t.instant('hive_database.notifications.error.title'),
                contentType: NOTIFICATION_CONTENT_TYPE.MODAL_LINK
              },
              levels: [NOTIFICATION_TYPES.ERROR]
            }
          })).pipe(
            switchMap(__ => {
              this.loadedResourceMap.databases[cluster] = true;
              return this.hiveService.checkDatabaseEncryption(cluster, path).pipe(
                map(extractError));
            }));
        }
        return this.hiveService.checkDatabaseEncryption(cluster, path).pipe(
          map(extractError));
      }
      return noErrors;
    }),
    take(1),
    tap(_ => this.cdRef.markForCheck()), );
  }
}
