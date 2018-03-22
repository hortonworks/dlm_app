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
  HostBinding, ChangeDetectionStrategy, OnDestroy, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { CloudContainer } from 'models/cloud-container.model';
import { CloudAccount } from 'models/cloud-account.model';
import { Cluster } from 'models/cluster.model';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
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
import { getAllProgressStates, getMergedProgress } from 'selectors/progress.selector';
import { loadDatabases } from 'actions/hivelist.action';
import { getAllDatabases } from 'selectors/hive.selector';
import { merge } from 'utils/object-utils';
import { wizardResetStep } from 'actions/policy.action';
import { clusterToListOption } from 'utils/policy-util';
import { ListStatus } from 'models/list-status.model';
import { AsyncActionsService } from 'services/async-actions.service';
import { HdfsService } from 'services/hdfs.service';
import { HiveService } from 'services/hive.service';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { filterClustersByTDE } from 'utils/cluster-util';
import { SERVICES } from 'constants/cluster.constant';
import { uniqBy, contains, without } from 'utils/array-util';
import { loadBeaconConfigStatus } from 'actions/beacon.action';
import { StepGeneralValue } from 'models/create-policy-form.model';
import { UnderlyingFsForHive } from 'models/beacon-config-status.model';
import { SelectOption } from 'components/forms/select-field';

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
  @Input() beaconStatuses: BeaconAdminStatus[] = [];
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
  s3Fields = ['cloudAccount', 's3endpoint', 'cloudEncryption', 'cloudEncryptionKey'];

  get sourceType(): SOURCE_TYPES {
    return this.form.value.source.type;
  }

  get sourceCluster() {
    return this.form.value.source.cluster;
  }

  get sourceClusters() {
    const clusters = this.general.type === POLICY_TYPES.HDFS ? this.sourceHdfsClusters : this.sourceHiveClusters;
    return clusters.map(cluster => clusterToListOption(cluster));
  }

  get sourceHiveClusters() {
    return this.clusters.filter(cluster => cluster.beaconConfigStatus &&
      cluster.beaconConfigStatus.underlyingFsForHive === UnderlyingFsForHive.HDFS &&
      this.hasPair(cluster, this.pairings));
  }

  get sourceHdfsClusters() {
    const pairedClusters = [];
    this.pairings.forEach(pair => {
      pairedClusters.push(pair.pair[0]);
      pairedClusters.push(pair.pair[1]);
    });
    let clustersWithHdfs = this.clusters.filter(c => !!c.status.find(s => s.service_name === SERVICES.HDFS));
    clustersWithHdfs = filterClustersByTDE(clustersWithHdfs, this.beaconStatuses);
    return uniqBy([...pairedClusters, ...clustersWithHdfs], 'id');
  }

  get sourceCloudAccount() {
    return this.form.value.source.cloudAccount;
  }

  get sourceCloudAccounts() {
    return this.filterCloudAccounts(this.form.value.source.type);
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
    return this.isHivePolicy() ? [cluster] : [s3, cluster];
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

  get shouldShowEncryptionKey(): boolean {
    return this.sourceType === SOURCE_TYPES.S3 && this.form.get('source.cloudEncryption').value === AWS_ENCRYPTION.SSE_KMS;
  }

  constructor(
    private store: Store<State>,
    private formBuilder: FormBuilder,
    private t: TranslateService,
    private asyncActions: AsyncActionsService,
    private hdfsService: HdfsService,
    private hiveService: HiveService,
    private cdRef: ChangeDetectorRef
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
        cloudEncryption: [null],
        cloudEncryptionKey: [null, Validators.required]
      })
    });
  }

  private getControlSafe(name: string, form: AbstractControl = this.form): AbstractControl {
    const f = () => '';
    const mock = {disable: f, enable: f};
    return (form.get(name) || mock) as AbstractControl;
  }

  ngOnInit() {
    this.form = this.initForm();
    this.store.select(getStep(this.WIZARD_STEP_ID.GENERAL)).subscribe(general => {
      this.general = general && 'value' in general ? general['value'] : {};
      if ('type' in this.general) {
        const selectedServiceType = this.general['type'];
        const sourceControls = this.form.get('source');
        const enable = selectedServiceType === POLICY_TYPES.HDFS ? this.hdfsFields : this.hiveFields;
        const disable = selectedServiceType === POLICY_TYPES.HDFS ? this.hiveFields : this.hdfsFields;
        enable.forEach(f => this.getControlSafe(f, sourceControls).enable());
        disable.forEach(f => this.getControlSafe(f, sourceControls).disable());
      }
    });
    const formSubscription = this.form.valueChanges.map(_ => this.isFormValid()).distinctUntilChanged()
      .subscribe(isFormValid => this.onFormValidityChange.emit(isFormValid));
    this.subscribeToSourceType();
    this.subscribeToSourceCluster();
    this.setupDatabaseChanges(this.form);
    this.setupSourceEncryptionUpdate(this.form);
    this.subscribeToCloudEncryption(this.form);
    this.subscriptions.push(formSubscription);
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

  handleHdfsPathChange(path) {
    this.selectedHdfsPath = path;
  }

  handleSearchChange(value: string) {
    this.databaseSearch$.next(value);
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

  /**
   * Reset destination form group if Source Type is changed
   * Reset other fields in the Source form group
   * Enable `directories`-field for Cluster and disable it for Cloud
   */
  private subscribeToSourceType() {
    const sourceControls = this.form.controls.source['controls'];
    const sourceTypeChangeSubscription = sourceControls.type.valueChanges.subscribe(type => {
      // Reset destination values if source type is changed
      this.store.dispatch(wizardResetStep(WIZARD_STEP_ID.DESTINATION));
      let toEnable = [], toDisable = [];
      if (type === this.SOURCE_TYPES.S3) {
        toEnable = without(this.s3Fields, 'cloudEncryptionKey');
        toDisable = this.clusterFields.concat(this.hdfsFields, this.hiveFields, ['cloudEncryptionKey']);
      }
      if (type === this.SOURCE_TYPES.CLUSTER) {
        toEnable = this.clusterFields.concat(this.general.type === POLICY_TYPES.HDFS ? this.hdfsFields : this.hiveFields);
        toDisable = this.s3Fields.concat(this.general.type === POLICY_TYPES.HDFS ? this.hiveFields : this.hdfsFields);
      }
      toDisable.forEach(p => sourceControls[p].disable());
      toEnable.forEach(p => sourceControls[p].enable());
    });
    this.subscriptions.push(sourceTypeChangeSubscription);
  }

  /**
   * Works only if Source Cluster is changed to another cluster and not for null or any other falsy value
   * Reset HDFS-path to root if Source Cluster is changed
   */
  private subscribeToSourceCluster() {
    const formControls = this.form.controls;
    const sourceTypeChangeSubscription = formControls.source['controls'].cluster.valueChanges.subscribe(cluster => {
      if (cluster) {
        this.selectedHdfsPath = this.root;
        this.selectedSource$.next(cluster);
        this.databaseSearch$.next('');
      }
    });
    this.subscriptions.push(sourceTypeChangeSubscription);
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
    const sourceDirectoryChanges$: Observable<string> = form.get('source.directories').valueChanges.distinctUntilChanged();
    const typeChanges$: Observable<string> = form.get('source.type').valueChanges.distinctUntilChanged();
    const findDir = (dirs: ListStatus[], fileName) => {
      return dirs.find(d => d.pathSuffix === fileName);
    };
    const encryptionValue$: Observable<boolean> = Observable
      .combineLatest(sourceDatabaseChanges$, sourceDirectoryChanges$, typeChanges$)
      .switchMap(([database, directory, type]) => {
        const cluster = form.get('source.cluster').value;
        if (type !== SOURCE_TYPES.CLUSTER) {
          return Observable.of(false);
        }
        if (this.isHDFSPolicy()) {
          return this.hdfsService.checkFileEncryption(cluster, directory);
        }
        return this.hiveService.checkDatabaseEncryption(cluster, database);
      });

    const updateEncryptionValue: Subscription = encryptionValue$.subscribe(isEncrypted => {
      form.patchValue({source: {datasetEncrypted: isEncrypted}});
    });
    this.subscriptions.push(updateEncryptionValue);
  }

  private subscribeToCloudEncryption(form: FormGroup): void {
    const cloudEncryptionChanges$: Observable<AWS_ENCRYPTION> = form.get('source.cloudEncryption').valueChanges.distinctUntilChanged();
    const updateEncryptionKeyAccess = cloudEncryptionChanges$.subscribe(value => {
      if (value === AWS_ENCRYPTION.SSE_KMS) {
        form.get('source.cloudEncryptionKey').enable();
      } else {
        form.get('source.cloudEncryptionKey').disable();
      }
    });
    this.subscriptions.push(updateEncryptionKeyAccess);
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
