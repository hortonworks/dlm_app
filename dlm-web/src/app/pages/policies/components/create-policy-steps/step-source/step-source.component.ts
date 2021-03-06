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
  Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, ChangeDetectionStrategy, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { CloudContainer } from 'models/cloud-container.model';
import { CloudAccount } from 'models/cloud-account.model';
import { Cluster } from 'models/cluster.model';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  POLICY_TYPES,
  WIZARD_STEP_ID,
  SOURCE_TYPES,
  SOURCE_TYPES_LABELS,
  AWS_ENCRYPTION,
  AWS_ENCRYPTION_LABELS
} from 'constants/policy.constant';
import { getStep } from 'selectors/create-policy.selector';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { loadTables } from 'actions/hivelist.action';
import { ProgressState } from 'models/progress-state.model';
import { DatabaseTablesCollapsedEvent } from 'components/hive-browser';
import { Observable } from 'rxjs/Observable';
import { HiveDatabase } from 'models/hive-database.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { HiveBrowserTablesLoadingMap } from 'components/hive-browser';
import { simpleSearch } from 'utils/string-utils';
import { getAllProgressStates, getMergedProgress, getProgressState } from 'selectors/progress.selector';
import { loadDatabases } from 'actions/hivelist.action';
import { getAllDatabases } from 'selectors/hive.selector';
import { merge, isEqual, omit, isEmpty } from 'utils/object-utils';
import { wizardResetStep } from 'actions/policy.action';
import { clusterToListOption, sortClusterListOptions, isOptionDisabled, getTooltip, dropdownClickHandler } from 'utils/policy-util';
import { ListStatus } from 'models/list-status.model';
import { AsyncActionsService } from 'services/async-actions.service';
import { HdfsService } from 'services/hdfs.service';
import { HiveService } from 'services/hive.service';
import { filterClustersByTDE, filterClustersByHdfsCloud } from 'utils/cluster-util';
import { SERVICES } from 'constants/cluster.constant';
import { uniqBy, contains, without, flatten } from 'utils/array-util';
import { StepGeneralValue, StepSourceValue } from 'models/create-policy-form.model';
import { UnderlyingFsForHive, BeaconSuperUserStatus } from 'models/beacon-config-status.model';
import { SelectOption } from 'components/forms/select-field';
import { FILES_REQUEST } from 'components/hdfs-browser/hdfs-browser.component';
import { BeaconService } from 'services/beacon.service';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { FILE_TYPES } from 'constants/hdfs.constant';
import { markAllPristine } from 'utils/form-util';
import { ClusterService } from 'services/cluster.service';

const DATABASE_REQUEST = '[StepSourceComponent] DATABASE_REQUEST';

@Component({
  selector: 'dlm-step-source',
  templateUrl: './step-source.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./step-source.component.scss']
})
export class StepSourceComponent implements OnInit, AfterViewInit, OnDestroy, StepComponent {

  @Input() pairings: Pairing[] = [];
  @Input() containers: any = {};
  @Input() accounts: CloudAccount[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() containersList: CloudContainer[] = [];
  @Input() sourceClusterId = 0;
  @Output() onFormValidityChange = new EventEmitter<boolean>();
  @HostBinding('class') className = 'dlm-step-source';

  private tableRequestPrefix = '[StepSourceComponent] LOAD_TABLES ';
  SOURCE_TYPES = SOURCE_TYPES;
  SOURCE_TYPES_LABELS = SOURCE_TYPES_LABELS;
  form: FormGroup;
  general: StepGeneralValue = {} as StepGeneralValue;
  WIZARD_STEP_ID = WIZARD_STEP_ID;
  root = '/';
  hdfsRootPath = '/';
  selectedHdfsPath = '/';
  subscriptions: Subscription[] = [];
  selectedSource$ = new BehaviorSubject(0);
  sourceDatabases$: Observable<HiveDatabase[]>;
  databaseSearch$ = new BehaviorSubject<string>('');
  databaseRequest$: Observable<ProgressState>;
  databaseTablesLoadingMap: HiveBrowserTablesLoadingMap = {};
  clusterSubmitted = false;
  submittedClusters = {};
  private hasSnapshottableAncestor = false;
  private initialFormValue: StepSourceValue;
  getTooltip = getTooltip.bind(this, this.t);
  isOptionDisabled = isOptionDisabled;
  dropdownClickHandler = dropdownClickHandler;

  /**
   * List of field-names related to cluster (source or destination)
   *
   * @type {string[]}
   */
  clusterFields = ['cluster'];

  hiveFields = ['databases'];
  hdfsFields = ['directories'];

  /**
   * List of field-names related to cloud (source or destination)
   *
   * @type {string[]}
   */
  s3Fields = ['cloudAccount', 's3endpoint', 'cloudEncryption'];

  get sourceType(): SOURCE_TYPES {
    return this.form.value.source.type;
  }

  get sourceCluster() {
    return this.form.value.source.cluster;
  }

  get sourceClusterResource(): Cluster {
    return this.clusters.find(cluster => cluster.id === this.sourceCluster) || {} as Cluster;
  }

  get showEnableSnapshot() {
    return this.isHDFSPolicy() && this.sourceCluster &&
      filterClustersByHdfsCloud(this.clusters).some(c => c.id === this.sourceCluster);
  }

  get sourceClusters() {
    const clusters = this.general.type === POLICY_TYPES.HDFS ? this.sourceHdfsClusters : this.sourceHiveClusters;
    return sortClusterListOptions(clusters.map(cluster => clusterToListOption(cluster)));
  }

  get sourceHiveClusters() {
    return this.clusters.filter(cluster => cluster.beaconConfigStatus &&
      cluster.beaconConfigStatus.underlyingFsForHive === UnderlyingFsForHive.HDFS &&
      this.hasPair(cluster, this.pairings));
  }

  get sourceHdfsClusters() {
    const pairedClusters = [];
    this.pairings.forEach(pair => {
      pairedClusters.push(this.clusters.filter(c => c.id === pair.pair[0].id || c.id === pair.pair[1].id));
    });
    let clustersWithHdfs = this.clusters.filter(c => !!c.status.find(s => s.service_name === SERVICES.HDFS));
    clustersWithHdfs = filterClustersByTDE(clustersWithHdfs);
    return uniqBy([...flatten(pairedClusters), ...clustersWithHdfs], 'id');
  }

  get sourceCloudAccount() {
    return this.form.value.source.cloudAccount;
  }

  get sourceCloudAccounts() {
    return this.filterCloudAccounts(this.form.value.source.type);
  }

  get enableSnapshotDisabled() {
    return !this.form.get('source.isSuperUser').value || this.hasSnapshottableAncestor || this.isDatasetEncrypted();
  }

  /**
   * List of Source Type options
   * Only Cluster can be a Source for HIVE Policies
   * Both Cluster and Cloud can be a Source for HDFS Policies
   *
   * @type {{label: string, value: string}}[]
   */
  get sourceTypes() {
    const cluster = {label: this.SOURCE_TYPES_LABELS[this.SOURCE_TYPES.CLUSTER], value: this.SOURCE_TYPES.CLUSTER};
    const s3 = {label: this.SOURCE_TYPES_LABELS[this.SOURCE_TYPES.S3], value: this.SOURCE_TYPES.S3};
    const clustersWithCloudHdfs = filterClustersByHdfsCloud(this.clusters);
    return this.isHivePolicy() || !clustersWithCloudHdfs.length ? [cluster] : [s3, cluster];
  }

  get cloudEncryptionOptions(): SelectOption[] {
    const sourceType = this.form.get('source.type').value;
    const makeOption = (value, label): SelectOption => ({label, value});
    const none: SelectOption = {value: null, label: 'None'};
    const optionsMap: {[sourceType: string]: SelectOption[]} = {
      [SOURCE_TYPES.S3]: [
        makeOption(AWS_ENCRYPTION.SSE_S3, AWS_ENCRYPTION_LABELS[AWS_ENCRYPTION.SSE_S3]),
        makeOption(AWS_ENCRYPTION.SSE_KMS, AWS_ENCRYPTION_LABELS[AWS_ENCRYPTION.SSE_KMS])
      ]
    };
    return [].concat.apply([none], sourceType === SOURCE_TYPES.CLUSTER ? [] : optionsMap[sourceType] || []);
  }

  get snapshotBasedReplicationWarning(): string {
    const setSnapshottable = this.form.value.source.setSnapshottable;
    const isSuperUser = this.form.value.source.isSuperUser;
    if (isSuperUser) {
      if (this.hasSnapshottableAncestor) {
        return this.t.instant('page.policies.form.fields.enableSnapshot.warning.snapshottable_ancestor');
      }
      if (this.isDatasetEncrypted()) {
        return this.t.instant('page.policies.form.fields.enableSnapshot.warning.encrypted_zone');
      }
      return setSnapshottable ? this.t.instant('page.policies.form.fields.enableSnapshot.warning.enabled') : null;
    } else {
      return this.t.instant('page.policies.form.fields.enableSnapshot.warning.not_super_user');
    }
  }

  constructor(
    private store: Store<State>,
    private formBuilder: FormBuilder,
    private t: TranslateService,
    private asyncActions: AsyncActionsService,
    private hdfsService: HdfsService,
    private hiveService: HiveService,
    private beaconService: BeaconService,
    private cdRef: ChangeDetectorRef,
    private wizardService: PolicyWizardService,
    private clusterService: ClusterService
  ) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      source: this.formBuilder.group({
        type: ['', Validators.required],
        cluster: ['', Validators.required],
        cloudAccount: ['', Validators.required],
        s3endpoint: ['', Validators.required],
        databases: ['', Validators.required],
        directories: ['', Validators.required],
        datasetEncrypted: [false],
        snapshotReady: [false],
        cloudEncryption: [null],
        setSnapshottable: [false],
        isSuperUser: [false]
      })
    });
  }

  private submitCluster(clusterId: number): Observable<any> {
    return this.clusterService.submitCluster(clusterId)
      .do(_ => this.submittedClusters[clusterId] = true)
      .catch(_ => {
        this.submittedClusters[clusterId] = false;
        return Observable.of(null);
      });
  }

  private updateOnActivation(form: FormGroup): void {
    const updateFormOnActivation = this.store.select(getStep(this.WIZARD_STEP_ID.GENERAL))
      .distinctUntilChanged(isEqual)
      .switchMap(general => this.wizardService.activeStep$(WIZARD_STEP_ID.SOURCE).mapTo(general))
      .subscribe(general => {
        // If policy type was changed, then reset the form
        if (this.general && general && 'value' in general && this.general.type !== general['value']['type']) {
          form.patchValue(this.initialFormValue);
          markAllPristine(form);
        }
        this.general = general && 'value' in general ? general['value'] : {};
        form.patchValue(form.getRawValue());
      });
    this.subscriptions.push(updateFormOnActivation);
  }

  ngOnInit() {
    this.form = this.initForm();
    this.initialFormValue = this.form.getRawValue();
    this.subscriptions.push(this.wizardService.publishValidationStatus(this, this.form));
    this.updateOnActivation(this.form);
    this.subscribeToFormChanges(this.form);
    this.subscribeToSourceType();
    this.subscribeToSourceCluster();
    this.setupDatabaseChanges(this.form);
    this.setupSourceEncryptionUpdate(this.form);
    this.setupDirectoryChanges(this.form);
  }

  ngAfterViewInit() {
    if (this.sourceClusterId) {
      this.form.patchValue({
        source: {
          type: this.SOURCE_TYPES.CLUSTER,
          cluster: Number(this.sourceClusterId)
        }
      });
    }
  }

  isFormValid() {
    return this.form.valid;
  }

  getFormValue() {
    return this.form.value;
  }

  validatePreselectedCluster() {
    if (this.sourceClusterId && this.sourceClusters.length && !this.sourceClusters.find(c => c.value === this.sourceCluster)) {
      this.form.patchValue({
        source: {
          type: '',
          cluster: ''
        }
      });
    }
  }

  private filterCloudAccounts(provider) {
    return this.accounts
      .filter(a => a.accountDetails.provider === provider)
      .map(a => ({label: a.id, value: a.id}));
  }

  isHDFSPolicy() {
    return this.general && 'type' in this.general && this.general['type'] === POLICY_TYPES.HDFS;
  }

  isHivePolicy() {
    return this.general && 'type' in this.general && this.general['type'] === POLICY_TYPES.HIVE;
  }

  isDatasetEncrypted() {
    return this.form.get('source.datasetEncrypted').value;
  }

  isDatasetSnapshotable() {
    return this.form.get('source.snapshotReady').value;
  }

  handleHdfsPathChange(path) {
    this.selectedHdfsPath = path;
  }

  handleSearchChange(value: string) {
    this.databaseSearch$.next(value);
  }

  handleSnapshotable(val) {
    this.form.patchValue({
      source: {
        setSnapshottable: val
      }
    });
  }

  onDatabaseTablesCollapsed(event: DatabaseTablesCollapsedEvent): void {
    const {database, collapsed} = event;
    const databaseId = database.entityId;
    if (!(databaseId in this.databaseTablesLoadingMap)) {
      this.store.dispatch(loadTables({
        clusterId: database.clusterId,
        databaseId: database.name
      }, {requestId: this.tableRequestPrefix + database.entityId}));
      this.databaseTablesLoadingMap[databaseId] = {isInProgress: true} as ProgressState;
    }
  }

  private updateFieldsAccess(form: FormGroup = this.form) {
    const { source } = form.getRawValue() as StepSourceValue;
    const sourceControls = form.get('source');
    let toEnable;
    let toDisable;
    if (source.type === SOURCE_TYPES.S3) {
      toDisable = flatten([this.hdfsFields, this.hiveFields, this.clusterFields]);
      toEnable = this.s3Fields;
    } else {
      toEnable = this.general.type === POLICY_TYPES.HDFS ? this.hdfsFields : this.hiveFields;
      toDisable = this.general.type === POLICY_TYPES.HDFS ? this.hiveFields : this.hdfsFields;
      toEnable = toEnable.concat(this.clusterFields);
      toDisable = toDisable.concat(this.s3Fields);
    }
    toDisable.forEach(p => sourceControls.get(p).enabled && sourceControls.get(p).disable());
    toEnable.forEach(p => sourceControls.get(p).disabled && sourceControls.get(p).enable());
  }

  /**
   * Reset destination form group if Source Type is changed
   * Reset other fields in the Source form group
   * Enable `directories`-field for Cluster and disable it for Cloud
   */
  private subscribeToSourceType() {
    const sourceControls = this.form.controls.source['controls'];
    const sourceTypeChangeSubscription = sourceControls.type.valueChanges.distinctUntilChanged().subscribe(type => {
      // Reset destination values if source type is changed
      this.store.dispatch(wizardResetStep(WIZARD_STEP_ID.DESTINATION));
    });
    this.subscriptions.push(sourceTypeChangeSubscription);
  }

  private subscribeToFormChanges(form: FormGroup) {
    const valueChange$ = form.valueChanges.distinctUntilChanged(isEqual);
    const updateFieldsAccess = valueChange$.subscribe(_ => this.updateFieldsAccess());
    this.subscriptions.push(updateFieldsAccess);
  }

  /**
   * Works only if Source Cluster is changed to another cluster and not for null or any other falsy value
   * Reset HDFS-path to root if Source Cluster is changed
   */
  private subscribeToSourceCluster() {
    const sourceTypeChangeSubscription = this.form.get('source.cluster').valueChanges.distinctUntilChanged().subscribe(cluster => {
      if (cluster) {
        this.clusterSubmitted = false;
        const skipClusterSubmission = this.submittedClusters[cluster] === true ||
          this.hasPair(this.clusters.find(c => c.id === cluster), this.pairings);
        this.submittedClusters[cluster] = skipClusterSubmission;
        const clusterSubmission$ = !skipClusterSubmission ? this.submitCluster(cluster) : Observable.of(null);
        clusterSubmission$.do(_ => {
          this.clusterSubmitted = true;
          this.selectedHdfsPath = this.root;
          this.hdfsRootPath = this.root;
          this.selectedSource$.next(cluster);
          this.databaseSearch$.next('');
        })
        .switchMap(_ => this.beaconService
          .fetchBeaconSuperUserStatus(cluster)
          .map((status: BeaconSuperUserStatus) => status))
        .subscribe(status => {
          const patchedValue = {source: {isSuperUser: status.hdfsSuperUser}} as any;
          if (!status.hdfsSuperUser) {
            patchedValue.source.setSnapshottable = false;
          }
          this.form.patchValue(patchedValue);
        }, _ => {
          this.form.patchValue({source: {isSuperUser: false, setSnapshottable: false}});
          return Observable.of({});
        });
      }
    });
    this.subscriptions.push(sourceTypeChangeSubscription);
  }

  private setDirectoriesPending(policyForm: FormGroup, pending = true): void {
    const control = policyForm.get('source.directories');
    let errors = omit(control.errors || {}, 'pending');
    errors = isEmpty(errors) ? null : errors;
    control.setErrors(pending ? {...(control.errors || {}), pending: true} : errors);
  }

  private setupDirectoryChanges(policyForm: FormGroup) {
    const directoryFieldChange$: Observable<string> = policyForm.valueChanges
      .pluck<any, string>('source', 'directories')
      .distinctUntilChanged()
      .do(() => {
        if (this.submittedClusters[this.sourceCluster]) {
          this.setDirectoriesPending(policyForm);
        }
      })
      .debounceTime(500)
      .do(path => {
        this.hdfsRootPath = path;
        this.setDirectoriesPending(policyForm);
        this.cdRef.detectChanges();
      });

    const directoryRequestStatus$ = this.store.select(getProgressState(FILES_REQUEST))
      .map(p => !p ? {isInProgress: true} as ProgressState : p)
      .distinctUntilKeyChanged('isInProgress')
      .filter((progressState: ProgressState) => {
        return progressState.isInProgress === false;
      });
    // this is the easiest way to get validation works for this field
    const validateDirectories = Observable
      .combineLatest(directoryFieldChange$, directoryRequestStatus$)
      .map(([_, progressState]: [string, ProgressState]) => {
        const directoriesField = policyForm.get('source.directories');
        if (this.submittedClusters[this.sourceCluster] === false) {
          return null;
        } else if (progressState.error) {
          return {notExist: true};
        } else {
          if (!progressState.response || !this.hdfsRootPath) {
            return null;
          }
          const files = progressState.response.fileList;
          const [tail] = this.hdfsRootPath.split('/').slice(-1);
          const isFile = files.length === 1 && files[0].type === FILE_TYPES.FILE &&
            tail === files[0].pathSuffix;
          if (isFile) {
            return {isFile: true};
          }
        }
        return null;
      })
      .switchMap((validationResult: any) => {
        if (validationResult !== null) {
          return Observable.of(validationResult);
        }
        const { beaconAdminStatus: { is10 } } = this.sourceClusterResource.beaconAdminStatus || {beaconAdminStatus: {is10: false}} as any;
        return is10 === true ? Observable.of(null) : this.hdfsService
          .checkSnapshottableAncestor(this.sourceCluster, policyForm.get('source.directories').value)
          .map(dir => dir ? { snapshottableAncestor: true } : null)
          .do(result => this.hasSnapshottableAncestor = result !== null);
      })
      .subscribe(error => {
        const { snapshottableAncestor, ...errors } = error || {} as any;
        this.setDirectoriesPending(policyForm, false);
        const directoriesField = policyForm.get('source.directories');
        directoriesField.setErrors(isEmpty(errors) ? null : errors);
      });
    this.subscriptions.push(validateDirectories);
  }

  private setupDatabaseChanges(form: FormGroup): void {
    const loadDatabasesSubscription = this.selectedSource$
      .filter(sourceCluster => !!sourceCluster)
      .subscribe(sourceCluster => {
        this.store.dispatch(loadDatabases(sourceCluster, {requestId: DATABASE_REQUEST}));
      });
    const databases$ = this.selectedSource$.switchMap(sourceCluster => {
      return this.store.select(getAllDatabases)
        .map(databases => databases.filter(db => db.clusterId === sourceCluster))
        .do(databases => {
          const selectedDatabase = form.value.source.databases;
          const selectedSource = form.value.source.cluster;
          // select first database when source changed and selected database is not exist on selected cluster
          if (databases.length && !databases.some(db => db.clusterId === selectedSource && db.name === selectedDatabase)) {
            form.patchValue({source: {databases: databases[0].name}});
          }
        });
    }) as Observable<HiveDatabase[]>;
    this.sourceDatabases$ = Observable.combineLatest(this.databaseSearch$, databases$)
      .map(([searchPattern, databases]) => databases.filter(db => simpleSearch(db.name, searchPattern)));
    this.databaseRequest$ = this.store.select(getMergedProgress(DATABASE_REQUEST));

    const updateTablesLoadingProgress = this.store.select(getAllProgressStates)
      .subscribe(progressList => {
        const updates: { [databaseId: string]: ProgressState } = progressList
          .reduce((all, progressState: ProgressState) => {
            if (progressState.requestId.startsWith(this.tableRequestPrefix)) {
              const databaseId = progressState.requestId.replace(this.tableRequestPrefix, '');
              return {
                ...all,
                [databaseId]: progressState
              };
            }
            return all;
          }, {});
        this.databaseTablesLoadingMap = merge({}, this.databaseTablesLoadingMap, updates);
        this.cdRef.markForCheck();
      });

    this.subscriptions.push(updateTablesLoadingProgress);
    this.subscriptions.push(loadDatabasesSubscription);
  }

  private setupSourceEncryptionUpdate(form: FormGroup): void {
    const sourceDatabaseChanges$: Observable<string> = form.get('source.databases').valueChanges.distinctUntilChanged();
    const sourceDirectoryChanges$: Observable<string> = form.get('source.directories')
      .valueChanges.distinctUntilChanged().debounceTime(500);
    const typeChanges$: Observable<string> = form.get('source.type').valueChanges.distinctUntilChanged();
    const directoryRequest$: Observable<boolean> = this.store.select(getMergedProgress(FILES_REQUEST))
      .pluck<ProgressState, boolean>('isInProgress').distinctUntilChanged();
    const encryptionValue$: Observable<any> = Observable
      .combineLatest(sourceDatabaseChanges$, sourceDirectoryChanges$, typeChanges$, directoryRequest$)
      .switchMap(([database, directory, type, dirRequestInProgress]) => {
        if (dirRequestInProgress && this.isHDFSPolicy()) {
          return Observable.of(form.get('source.datasetEncrypted').value);
        }
        const cluster = form.get('source.cluster').value;
        if (type !== SOURCE_TYPES.CLUSTER) {
          return Observable.of({} as ListStatus);
        }
        if (this.isHDFSPolicy()) {
          return this.hdfsService.checkFileEncryption(cluster, directory);
        }
        return this.hiveService.checkDatabaseEncryption(cluster, database);
      });

    const updateEncryptionValue: Subscription = encryptionValue$.subscribe(status => {
      if (status) {
        form.patchValue({source: {datasetEncrypted: status.isEncrypted, snapshotReady: status.snapshottable}});
      }
      this.cdRef.markForCheck();
    });
    this.subscriptions.push(updateEncryptionValue);
  }

  private hasPair(cluster: Cluster, pairings: Pairing[]): boolean {
    return pairings.some(pairing => contains(pairing.pair.map(p => p.id), cluster.id));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
