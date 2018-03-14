/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { CloudContainer } from 'models/cloud-container.model';
import { CloudAccount, HttpProgress } from 'models/cloud-account.model';
import { SourceValue, StepGeneralValue } from 'models/create-policy-form.model';
import { Cluster } from 'models/cluster.model';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { POLICY_TYPES, WIZARD_STEP_ID, SOURCE_TYPES, SOURCE_TYPES_LABELS, TDE_KEY_TYPE, TDE_KEY_LABEL } from 'constants/policy.constant';
import { getSteps } from 'selectors/create-policy.selector';
import { TranslateService } from '@ngx-translate/core';
import { mapToList } from 'utils/store-util';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { Subscription } from 'rxjs/Subscription';
import { getClusterEntities, clusterToListOption } from 'utils/policy-util';
import { validatePolicy } from 'actions/policy.action';
import { omitEmpty } from 'utils/object-utils';
import { getPolicyValidationProgress } from 'selectors/create-policy.selector';
import { PROGRESS_STATUS } from 'constants/status.constant';
import { PolicyService } from 'services/policy.service';
import { contains } from 'utils/array-util';
import { HdfsService } from 'services/hdfs.service';
import { HiveService } from 'services/hive.service';
import { AsyncActionsService } from 'services/async-actions.service';
import { RadioItem } from 'common/radio-button/radio-button';
import { loadDatabases } from 'actions/hivelist.action';
import { omit, isEmpty } from 'utils/object-utils';

@Component({
  selector: 'dlm-step-destination',
  templateUrl: './step-destination.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepDestinationComponent implements OnInit, OnDestroy, StepComponent {

  @Input() pairings: Pairing[] = [];
  @Input() containers: any = {};
  @Input() accounts: CloudAccount[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() beaconStatuses: BeaconAdminStatus[] = [];
  @Input() containersList: CloudContainer[] = [];
  subscriptions: Subscription[] = [];
  @Output() onFormValidityChange = new EventEmitter<boolean>();
  @HostBinding('class') className = 'dlm-step-destination';

  validationResults: HttpProgress;
  showValidation = true;
  validationInProgress = false;
  form: FormGroup;
  source: SourceValue = {} as SourceValue;
  general: StepGeneralValue = {} as StepGeneralValue;
  WIZARD_STEP_ID = WIZARD_STEP_ID;
  POLICY_TYPES = POLICY_TYPES;
  SOURCE_TYPES = SOURCE_TYPES;
  SOURCE_TYPES_LABELS = SOURCE_TYPES_LABELS;

  loadedResourceMap = {
    databases: {}
  };

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
  s3Fields = ['cloudAccount', 's3endpoint'];

  get destinationType() {
    return this.form.value.destination.type;
  }

  private filterCloudAccounts(provider) {
    return this.accounts
      .filter(a => a.accountDetails.provider === provider)
      .map(a => ({label: a.id, value: a.id}));
  }

  get destinationCloudAccounts() {
    return this.filterCloudAccounts(this.form.value.destination.type);
  }

  get isClusterType(): boolean {
    return this.destinationType === SOURCE_TYPES.CLUSTER;
  }

  get isClusterSelected(): boolean {
    return this.form.get('destination.cluster').value !== '';
  }

  get destinationClusters() {
    const sourceType = this.source.type;
    if (sourceType === SOURCE_TYPES.CLUSTER) {
      if (this.source.cluster) {
        const pairings = this.pairings.filter(pairing => pairing.pair.filter(cluster => +cluster.id === +this.source.cluster).length);
        if (pairings.length) {
          const clusterEntities = getClusterEntities(pairings);
          // Remove source cluster from the entities
          delete clusterEntities[this.source.cluster];
          return mapToList(clusterEntities);
        }
        return [{
          label: this.t.instant('page.policies.form.fields.destinationCluster.noPair'),
          value: ''
        }];
      }
      return [{
        label: this.t.instant('page.policies.form.fields.destinationCluster.default'),
        value: ''
      }];
    }
    return this.clusters.filter(cluster => {
      const status = this.beaconStatuses.find(c => c.clusterId === cluster.id);
      return status ? status.beaconAdminStatus.replication_cloud_fs : false;
    }).map(cluster => clusterToListOption(cluster));
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
    const cluster = {label: this.SOURCE_TYPES_LABELS[this.SOURCE_TYPES.CLUSTER], value: this.SOURCE_TYPES.CLUSTER};
    const s3 = {label: this.SOURCE_TYPES_LABELS[this.SOURCE_TYPES.S3], value: this.SOURCE_TYPES.S3};
    const onlyCluster = [cluster];
    if (this.general.type === POLICY_TYPES.HIVE || this.source.type === SOURCE_TYPES.S3) {
      return onlyCluster;
    }
    const status = this.beaconStatuses.find(c => c.clusterId === sourceClusterId);
    const replicationCloudFS = status ? status.beaconAdminStatus.replication_cloud_fs : false;
    return replicationCloudFS ? [s3, cluster] : onlyCluster;
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

  get shouldShowTDEWarning(): boolean {
    return this.isSourceEncrypted && this.form.get('destination.tdeKey').value === TDE_KEY_TYPE.SAME_KEY;
  }

  get isSourceEncrypted(): boolean {
    return this.source.datasetEncrypted;
  }

  constructor(
    private store: Store<State>,
    private formBuilder: FormBuilder,
    private t: TranslateService,
    private hdfsService: HdfsService,
    private hiveService: HiveService,
    private asyncActions: AsyncActionsService,
    private cdRef: ChangeDetectorRef
  ) {
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      destination: this.formBuilder.group({
        type: ['', Validators.required],
        cluster: ['', Validators.required],
        cloudAccount: ['', Validators.required],
        s3endpoint: ['', Validators.required],
        path: ['', Validators.required],
        tdeKey: [TDE_KEY_TYPE.DIFFERENT_KEY],
        skipValidation: [false],
        validationStatus: [false],
        validationPerformed: [false]
      })
    });
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
        toEnable = this.s3Fields;
        toDisable = this.clusterFields;
      }
      if (type === SOURCE_TYPES.CLUSTER) {
        toEnable = this.clusterFields;
        toDisable = this.s3Fields;
      }
      if (type === SOURCE_TYPES.CLUSTER && this.source.type === SOURCE_TYPES.CLUSTER) {
        this.showValidation = false;
        this.form.patchValue({
          destination: {
            skipValidation: true
          }
        });
      } else {
        this.showValidation = true;
        this.form.patchValue({
          destination: {
            skipValidation: false
          }
        });
      }
      toDisable.forEach(p => destinationControls[p].disable());
      toEnable.forEach(p => destinationControls[p].enable());
    });
    this.subscriptions.push(subscription);
  }

  private setPending(control: AbstractControl, pending = true) {
    control.setErrors(pending ? {...(control.errors || {}), pending: true } : omit(control.errors || {}, 'pending'));
  }

  private subscribeToDestinationPath(form: FormGroup) {
    const typeChanges$ = form.get('destination.type').valueChanges.distinctUntilChanged();
    const clusterChanges$ = form.get('destination.cluster').valueChanges.distinctUntilChanged();
    const destinationPathChanges$ = form.get('destination.path').valueChanges.distinctUntilChanged().debounceTime(500);
    const extractError = isEncrypted => isEncrypted ? null : { encryption: true };
    const pathValidation$ = Observable
      .combineLatest(typeChanges$, clusterChanges$, destinationPathChanges$)
      .switchMap(([type, cluster, path]) => {
        const noErrors = Observable.of(null);
        this.setPending(form.get('destination.path'));
        if (!this.isSourceEncrypted || !cluster || contains([this.source.type, type], SOURCE_TYPES.S3)) {
          return noErrors;
        }
        if (this.general.type === POLICY_TYPES.HDFS) {
          return this.hdfsService.checkFileEncryption(cluster, path)
            .map(extractError);
        } else if (this.general.type === POLICY_TYPES.HIVE) {
          if (!this.loadedResourceMap.databases[cluster]) {
            return this.asyncActions.dispatch(loadDatabases(cluster))
              .switchMap(_ => {
                this.loadedResourceMap.databases[cluster] = true;
                return this.hiveService.checkDatabaseEncryption(cluster, path)
                  .map(extractError);
              });
          }
          return this.hiveService.checkDatabaseEncryption(cluster, path)
            .map(extractError);
        }
        return noErrors;
      });

    const validateDestinationPath = pathValidation$.subscribe(error => {
      this.setPending(form.get('destination.path'), false);
      if (error) {
        form.get('destination.path').markAsTouched();
      }
      const errors = {...form.get('destination.path').errors, ...error};
      form.get('destination.path').setErrors(isEmpty(errors) ? null : errors);
      this.onFormValidityChange.emit(form.valid);
      this.cdRef.markForCheck();
    });

    this.subscriptions.push();
  }

  ngOnInit() {
    this.form = this.initForm();
    const validationSubscription = this.store.select(getPolicyValidationProgress)
      .subscribe(validationResults => {
        this.validationResults = validationResults;
        this.validationInProgress = false;
        if (validationResults.state) {
          this.form.patchValue({
            destination: {
              validationPerformed: true,
              validationStatus: validationResults.state === PROGRESS_STATUS.SUCCESS
            }
          });
        }
      });
    const prevStepsSubscription = this.store.select(getSteps(this.WIZARD_STEP_ID.GENERAL, this.WIZARD_STEP_ID.SOURCE))
      .subscribe(([general, source]) => {
        const controls = this.form.controls.destination['controls'];
        this.general = general.value || {};
        this.source = source.value && source.value.source || {};
        if (this.source.type === SOURCE_TYPES.CLUSTER) {
          this.form.patchValue({
            destination: {
              path: this.general.type === POLICY_TYPES.HDFS ?
                this.source.directories : this.source.databases
            }
          });
        } else {
          this.form.patchValue({destination: {path: ''}});
        }
      });
    this.form.valueChanges.map(_ => this.isFormValid()).distinctUntilChanged()
      .subscribe(isFormValid => this.onFormValidityChange.emit(isFormValid));
    this.subscriptions.push(validationSubscription);
    this.subscriptions.push(prevStepsSubscription);
    this.subscriptions.push(this.form.valueChanges.subscribe(value => {
      if (value.destination.validationStatus) {
        this.form.patchValue({
          destination: {
            validationPerformed: false,
            validationStatus: false
          }
        });
      }
    }));
    this.subscribeToDestinationType();
    this.subscribeToDestinationPath(this.form);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  isFormValid() {
    const validationStatus = this.form.get('destination.validationStatus').value;
    const skipValidation = this.form.get('destination.skipValidation').value;
    if (skipValidation) {
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
    const requestData: any = {
      type: this.general.type,
      cloudCred: this.source.cloudAccount || form.get('destination.cloudAccount').value,
      sourceDataset: this.source.type === SOURCE_TYPES.S3 ? this.source.s3endpoint : this.source.directories,
      targetDataset: form.get('destination.type').value === SOURCE_TYPES.S3 ?
        form.get('destination.s3endpoint').value : form.get('destination.path').value
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
    if (targetCluster) {
      targetClusterId = PolicyService.makeClusterId(targetCluster.dataCenter, targetCluster.name);
      requestData.idForUrl = targetCluster.id;
      requestData.targetCluster = targetClusterId;
    }
    this.store.dispatch(validatePolicy(omitEmpty(requestData), {}));
  }

  handleSkipValidation(skipValidation) {
    this.form.patchValue({
      destination: {
        skipValidation
      }
    });
  }
}
