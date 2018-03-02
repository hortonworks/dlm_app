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
  HostBinding, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { CloudContainer } from 'models/cloud-container.model';
import { CloudAccount } from 'models/cloud-account.model';
import { Cluster } from 'models/cluster.model';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { POLICY_TYPES, WIZARD_STEP_ID, SOURCE_TYPES} from 'constants/policy.constant';
import { getStep } from 'selectors/create-policy.selector';
import { TranslateService } from '@ngx-translate/core';
import { mapToList } from 'utils/store-util';
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
import { getClusterEntities } from 'utils/policy-util';

const DATABASE_REQUEST = '[StepSourceComponent] DATABASE_REQUEST';

@Component({
  selector: 'dlm-step-source',
  templateUrl: './step-source.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepSourceComponent implements OnInit, OnDestroy, StepComponent {

  @Input() pairings: Pairing[] = [];
  @Input() containers: any = {};
  @Input() accounts: CloudAccount[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() containersList: CloudContainer[] = [];
  @Output() onFormValidityChange = new EventEmitter<boolean>();
  @HostBinding('class') className = 'dlm-step-source';

  private tableRequestPrefix = '[StepSourceComponent] LOAD_TABLES ';
  SOURCE_TYPES = SOURCE_TYPES;
  form: FormGroup;
  general: {};
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

  /**
   * List of field-names related to cloud (source or destination)
   *
   * @type {string[]}
   */
  s3Fields = ['cloudAccount', 's3endpoint'];

  get sourceType() {
    return this.form.value.source.type;
  }

  get sourceCluster() {
    return this.form.value.source.cluster;
  }

  get sourceClusters() {
    return mapToList(getClusterEntities(this.pairings));
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
    const cluster = {label: this.SOURCE_TYPES.CLUSTER, value: this.SOURCE_TYPES.CLUSTER};
    const s3 = {label: this.SOURCE_TYPES.S3, value: this.SOURCE_TYPES.S3};
    return this.isHivePolicy() ? [cluster] : [s3, cluster];
  }

  constructor(private store: Store<State>, private formBuilder: FormBuilder, private t: TranslateService) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      source: this.formBuilder.group({
        type: ['', Validators.required],
        cluster: ['', Validators.required],
        cloudAccount: ['', Validators.required],
        s3endpoint: ['', Validators.required],
        databases: ['', Validators.required],
        directories: ['', Validators.required],
      })
    });
  }

  ngOnInit() {
    this.form = this.initForm();
    this.store.select(getStep(this.WIZARD_STEP_ID.GENERAL)).subscribe(general => {
      this.general = general && 'value' in general ? general['value'] : {};
      if ('type' in this.general) {
        const selectedServiceType = this.general['type'];
        const sourceControls = this.form.controls.source['controls'];
        if (selectedServiceType === POLICY_TYPES.HDFS) {
          sourceControls['databases'].disable();
        } else if (selectedServiceType === POLICY_TYPES.HIVE) {
          sourceControls['directories'].disable();
        }
      }
    });
    const formSubscription = this.form.valueChanges.map(_ => this.isFormValid()).distinctUntilChanged()
      .subscribe(isFormValid => this.onFormValidityChange.emit(isFormValid));
    this.subscribeToSourceType();
    this.subscribeToSourceCluster();
    this.setupDatabaseChanges(this.form);
    this.subscriptions.push(formSubscription);
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
      .map(a => ({label: a.accountDetails['userName'] || a.accountDetails['accountName'], value: a.id}));
  }

  isHDFSPolicy() {
    return this.general && 'type' in this.general && this.general['type'] === POLICY_TYPES.HDFS;
  }

  isHivePolicy() {
    return this.general && 'type' in this.general && this.general['type'] === POLICY_TYPES.HIVE;
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
        toEnable = this.s3Fields;
        toDisable = this.clusterFields;
        sourceControls['directories'].disable();
      }
      if (type === this.SOURCE_TYPES.CLUSTER) {
        toEnable = this.clusterFields;
        toDisable = this.s3Fields;
        if (this.general['type'] === POLICY_TYPES.HDFS) {
          sourceControls['directories'].enable();
        }
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
      });

    this.subscriptions.push(updateTablesLoadingProgress);
    this.subscriptions.push(loadDatabasesSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
