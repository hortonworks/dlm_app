import { Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter, HostBinding, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { go } from '@ngrx/router-store';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { RadioItem } from 'common/radio-button/radio-button';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { POLICY_TYPES, POLICY_SUBMIT_TYPES } from 'constants/policy.constant';
import { markAllTouched } from 'utils/form-util';
import { getDatePickerDate } from 'utils/date-util';
import { TranslateService } from '@ngx-translate/core';
import { mapToList } from 'utils/store-util';
import { simpleSearch } from 'utils/string-utils';
import { loadFullDatabases } from 'actions/hivelist.action';
import { getAllDatabases } from 'selectors/hive.selector';
import { HiveDatabase } from 'models/hive-database.model';

export const POLICY_FORM_ID = 'POLICY_FORM_ID';

// todo: validation
// todo: error reporting. Figure out the way to consolidate field + error with single component
// todo: schedule tabs should be filled with form values
// todo: serialize form value to model
@Component({
  selector: 'dlm-policy-form',
  templateUrl: './policy-form.component.html',
  styleUrls: ['./policy-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PolicyFormComponent implements OnInit, OnDestroy {
  @Input() pairings: Pairing[] = [];
  @Output() formSubmit = new EventEmitter<any>();
  @HostBinding('class') className = 'dlm-policy-form';
  policySubmitTypes = POLICY_SUBMIT_TYPES;
  policyForm: FormGroup;
  selectedSource$ = new BehaviorSubject('');
  sourceDatabases$: Observable<HiveDatabase[]>;
  databaseSearch$ = new BehaviorSubject<string>('');
  subscriptions: Subscription[] = [];
  get datePickerOptions(): IMyOptions {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const today = new Date();
    return {
      dateFormat: 'yyyy-mm-dd',
      markCurrentDay: true,
      disableUntil: getDatePickerDate(yesterday),
      markDates: [{
        dates: [getDatePickerDate(today)],
        color: '#ff0000'
      }]
    };
  };
  sectionCollapsedMap = {
    general: false,
    database: false,
    directories: false,
    job: false
  };
  frequencyMap = {
    hourly: 60 * 60,
    daily: 24 * 60 * 60,
    weekly: 7 * 24 * 60 * 60,
    monthly: 30 * 24 * 60 * 60
  };
  scheduleTabs = [
    { title: 'common.time.hourly', value: this.frequencyMap.hourly },
    { title: 'common.time.daily', value: this.frequencyMap.daily },
    { title: 'common.time.weekly', value: this.frequencyMap.weekly },
    { title: 'common.time.monthly', value: this.frequencyMap.monthly }
  ];
  storageTypes = <RadioItem[]>[
    {
      label: 'HDFS',
      value: POLICY_TYPES.HDFS
    },
    {
      label: 'HIVE',
      value: POLICY_TYPES.HIVE
    }
  ];
  jobTypes = <RadioItem[]>[
    // todo: enable this when API will support
    // {
    //   label: 'One Time',
    //   value: this.policySubmitTypes.SUBMIT
    // },
    {
      label: 'On Schedule',
      value: this.policySubmitTypes.SCHEDULE
    }
  ];
  selectedJobType: string = this.jobTypes[0].value;
  selectedPolicyType = POLICY_TYPES.HDFS;
  hdfsRootPath = '/';
  selectedHdfsPath = '/';
  get defaultTime(): Date {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    return date;
  }

  get sourceClusters() {
    return mapToList(this.getClusterEntities(this.pairings));
  }

  get destinationClusters() {
    if (this.sourceCluster) {
      const pairings = this.pairings.filter(pairing => pairing.pair.filter(cluster => cluster.id === this.sourceCluster).length);
      if (pairings) {
        const clusterEntities = this.getClusterEntities(pairings);
        // Remove source cluster from the entities
        delete clusterEntities[this.sourceCluster];
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

  get sourceCluster() {
    return this.policyForm.value.general.sourceCluster;
  }

  get destinationCluster() {
    return this.policyForm.value.general.destinationCluster;
  }

  getClusterEntities(pairings) {
    return pairings.reduce((entities: {[id: number]: {}}, entity: Pairing) => {
      const getClusters = (pairing) => {
        return pairing.pair.reduce((clusters: {}, cluster) => {
          return Object.assign({}, clusters, {
            [cluster.id]: {
              label: cluster.name,
              value: cluster.id
            }
          });
        }, {});
      };
      return Object.assign({}, entities, getClusters(entity));
    }, {});
  }

  constructor(private formBuilder: FormBuilder, private store: Store<State>, private t: TranslateService) { }

  ngOnInit() {
    const loadDatabasesSubscription = this.selectedSource$
      .filter(sourceCluster => !!sourceCluster)
      .subscribe(sourceCluster => {
        this.store.dispatch(loadFullDatabases(sourceCluster));
      });
    const databases$ = this.selectedSource$.switchMap(sourceCluster => {
      return this.store.select(getAllDatabases).map(databases => {
        const dbs = databases.filter(db => db.clusterId === sourceCluster);
        if (dbs.length) {
          this.policyForm.patchValue({databases: dbs[0].id});
        }
        return dbs;
      });
    });
    this.sourceDatabases$ = Observable.combineLatest(this.databaseSearch$, databases$)
      .map(([searchPattern, databases]) => {
        return databases.filter(db => simpleSearch(db.name, searchPattern));
      });
    this.policyForm = this.formBuilder.group({
      general: this.formBuilder.group({
        name: ['', Validators.required],
        type: [this.selectedPolicyType],
        sourceCluster: ['', Validators.required],
        destinationCluster: ['', Validators.required]
      }),
      databases: ['', Validators.required],
      directories: ['', Validators.required],
      job: this.formBuilder.group({
        schedule: this.policySubmitTypes.SCHEDULE,
        frequencyInSec: 3600,
        endTime: this.formBuilder.group({
          date: [''],
          time: [this.defaultTime]
        }, { validator: this.validateTime}),
        startTime: this.formBuilder.group({
          date: [''],
          time: [this.defaultTime]
        }, { validator: this.validateTime})
      })
    });
    this.policyForm.get('databases').disable();
    this.subscriptions.push(loadDatabasesSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleSubmit({ value }) {
    if (this.policyForm.valid) {
      this.formSubmit.emit(value);
    }
    markAllTouched(this.policyForm);
  }

  handleJobChange(radio: RadioItem) {
    this.selectedJobType = radio.value;
    if (radio.value === this.policySubmitTypes.SUBMIT) {
      this.updateFrequency(0);
    }
  }

  handleSearchChange(value: string) {
    this.databaseSearch$.next(value);
  }

  toggleSection(section: string) {
    this.sectionCollapsedMap[section] = !this.sectionCollapsedMap[section];
  }

  updateFrequency(frequency) {
    this.policyForm.patchValue({ job: { frequencyInSec: frequency }});
  }

  isHDFSPolicy() {
    return this.policyForm.value.general.type === POLICY_TYPES.HDFS;
  }

  isHivePolicy() {
    return this.policyForm.value.general.type === POLICY_TYPES.HIVE;
  }

  isScheduled() {
    return this.selectedJobType === POLICY_SUBMIT_TYPES.SCHEDULE;
  }

  handleDateChange(date: IMyDateModel, dateType: string) {
    this.policyForm.patchValue({ job: {[dateType]: { date: date.formatted }}});
  }

  handlePolicyTypeChange(radioItem: RadioItem) {
    const { value } = radioItem;
    let disableField,
        enableField;
    if (value === POLICY_TYPES.HDFS) {
      disableField = 'databases';
      enableField  = 'directories';
    } else if (value === POLICY_TYPES.HIVE) {
      disableField = 'directories';
      enableField = 'databases';
    }
    this.policyForm.get(enableField).enable();
    this.policyForm.get(disableField).disable();
    this.databaseSearch$.next('');
  }

  handleJobTabChange(tab) {
    this.updateFrequency(tab.value);
    this.policyForm.patchValue({
      job: {
        endTime: { date: '', time: this.defaultTime },
        startTime: { date: '', time: this.defaultTime }
      }
    });
  }

  handleSourceClusterChange(sourceCluster) {
    this.selectedHdfsPath = this.hdfsRootPath;
    this.policyForm.patchValue({
      general: {
        destinationCluster: ''
      }
    });
    this.selectedSource$.next(sourceCluster);
    this.databaseSearch$.next('');
  }

  handleHdfsPathChange(path) {
    this.selectedHdfsPath = path;
  }

  cancel() {
    this.store.dispatch(go(['policies']));
  }

  validateTime = (formGroup: FormGroup) => {
    if (!(formGroup && formGroup.controls)) {
      return null;
    }
    const timeControl = formGroup.controls.time;
    const dateFieldValue = formGroup.controls.date.value;
    const timeFieldValue = timeControl.value;
    timeControl.setErrors(null);
    if (dateFieldValue) {
      const dateWithTime = this.setTimeForDate(dateFieldValue, timeFieldValue);
      if (dateWithTime.getTime() < Date.now()) {
        // TODO: figure out if it depends on time zone
        // timeControl.setErrors({ lessThanCurrent: true });
        return null;
      }
    }
    return null;
  }

  private setTimeForDate(date: string, time: string): Date {
    const dateValue = new Date(date);
    const timeValue = new Date(time);
    dateValue.setHours(timeValue.getHours());
    dateValue.setMinutes(timeValue.getMinutes());
    dateValue.setSeconds(0);
    return dateValue;
  }
}
