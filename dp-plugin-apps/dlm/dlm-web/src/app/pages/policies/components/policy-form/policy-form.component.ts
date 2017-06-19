import { Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, SimpleChanges, OnDestroy, OnChanges, ChangeDetectionStrategy } from '@angular/core';
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
import { POLICY_TYPES, POLICY_SUBMIT_TYPES, POLICY_REPEAT_MODES, POLICY_TIME_UNITS, POLICY_DAYS } from 'constants/policy.constant';
import { getFormValues } from 'selectors/form.selector';
import { markAllTouched } from 'utils/form-util';
import { getDatePickerDate } from 'utils/date-util';
import { TranslateService } from '@ngx-translate/core';
import { mapToList } from 'utils/store-util';
import { simpleSearch } from 'utils/string-utils';
import { loadFullDatabases } from 'actions/hivelist.action';
import { getAllDatabases } from 'selectors/hive.selector';
import { HiveDatabase } from 'models/hive-database.model';
import { SelectOption } from 'components/forms/select-field';
import * as moment from 'moment';

export const POLICY_FORM_ID = 'POLICY_FORM_ID';

@Component({
  selector: 'dlm-policy-form',
  templateUrl: './policy-form.component.html',
  styleUrls: ['./policy-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolicyFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() pairings: Pairing[] = [];
  @Input() sourceClusterId = 0;
  @Output() formSubmit = new EventEmitter<any>();
  @HostBinding('class') className = 'dlm-policy-form';
  policyRepeatModes = POLICY_REPEAT_MODES;
  policyTimeUnits = POLICY_TIME_UNITS;
  policyDays = POLICY_DAYS;
  policySubmitTypes = POLICY_SUBMIT_TYPES;
  policyForm: FormGroup;
  selectedSource$ = new BehaviorSubject('');
  sourceDatabases$: Observable<HiveDatabase[]>;
  databaseSearch$ = new BehaviorSubject<string>('');
  subscriptions: Subscription[] = [];
  policyFormValues$;
  databaseListGroup: FormGroup;
  _pairings$: BehaviorSubject<Pairing[]> = new BehaviorSubject([]);
  _sourceClusterId$: BehaviorSubject<number> = new BehaviorSubject(0);
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
    job: false,
    advanced: true
  };
  frequencyMap = {
    [this.policyTimeUnits.MINUTES]: 60,
    [this.policyTimeUnits.HOURS]: 60 * 60,
    [this.policyTimeUnits.DAYS]: 24 * 60 * 60,
    [this.policyTimeUnits.WEEKS]: 7 * 24 * 60 * 60
  };
  storageTypes = <RadioItem[]> [
    {
      label: this.t.instant('common.hdfs'),
      value: POLICY_TYPES.HDFS
    },
    {
      label: this.t.instant('common.hive'),
      value: POLICY_TYPES.HIVE
    }
  ];
  repeatOptions = <SelectOption[]> [
    {
      label: this.t.instant('common.frequency.every'),
      value: this.policyRepeatModes.EVERY
    }, {
      label: this.t.instant('common.frequency.never'),
      value: this.policyRepeatModes.NEVER
    }
  ];
  units = <SelectOption[]> [
    {
      label: this.t.instant('common.time.weeks'),
      value: this.policyTimeUnits.WEEKS
    },
    {
      label: this.t.instant('common.time.days'),
      value: this.policyTimeUnits.DAYS
    },
    {
      label: this.t.instant('common.time.hours'),
      value: this.policyTimeUnits.HOURS
    },
    {
      label: this.t.instant('common.time.minutes'),
      value: this.policyTimeUnits.MINUTES
    }
  ];
  dayOptions = <RadioItem[]> [
    {
      label: 'Mo',
      value: this.policyDays.MONDAY
    },
    {
      label: 'Tu',
      value: this.policyDays.TUESDAY
    },
    {
      label: 'We',
      value: this.policyDays.WEDNESDAY
    },
    {
      label: 'Th',
      value: this.policyDays.THURSDAY
    },
    {
      label: 'Fr',
      value: this.policyDays.FRIDAY
    },
    {
      label: 'Sa',
      value: this.policyDays.SATURDAY
    },
    {
      label: 'Su',
      value: this.policyDays.SUNDAY
    }
  ];
  selectedPolicyType = POLICY_TYPES.HDFS;
  root = '/';
  hdfsRootPath = '/';
  selectedHdfsPath = '/';
  get defaultTime(): Date {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
  }

  get sourceClusters() {
    return mapToList(this.getClusterEntities(this.pairings));
  }

  get destinationClusters() {
    if (this.sourceCluster) {
      const pairings = this.pairings.filter(pairing => pairing.pair.filter(cluster => +cluster.id === +this.sourceCluster).length);
      if (pairings.length) {
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

  get selectedDay() {
    return this.policyForm.value.job.day;
  }

  get repeatOption() {
    return this.policyForm.value.job.repeatMode;
  }

  get unit() {
    return this.policyForm.value.job.unit;
  }

  get sourceCluster() {
    return this.policyForm.value.general.sourceCluster;
  }

  get destinationCluster() {
    return this.policyForm.value.general.destinationCluster;
  }

  constructor(private formBuilder: FormBuilder,
              private store: Store<State>,
              private t: TranslateService) { }

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
        description: [''],
        type: [this.selectedPolicyType],
        sourceCluster: ['', Validators.required],
        destinationCluster: ['', Validators.required]
      }),
      databases: ['', Validators.required],
      directories: ['', Validators.required],
      job: this.formBuilder.group({
        repeatMode: this.policyRepeatModes.EVERY,
        frequency: [''],
        day: this.policyDays.MONDAY,
        frequencyInSec: 0,
        unit: this.policyTimeUnits.DAYS,
        schedule: this.policySubmitTypes.SCHEDULE,
        endTime: this.formBuilder.group({
          date: [''],
          time: [this.defaultTime]
        }, { validator: this.validateTime }),
        startTime: this.formBuilder.group({
          date: [''],
          time: [this.defaultTime]
        }, { validator: this.validateTime })
      }),
      advanced: this.formBuilder.group({
        queue_name: [''],
        max_bandwidth: ['']
      })
    });
    this.policyForm.get('databases').disable();
    this.subscriptions.push(loadDatabasesSubscription);
    this.policyFormValues$ = this.store.select(getFormValues(POLICY_FORM_ID));
    const policyFormValuesSubscription = Observable.combineLatest(this.policyFormValues$, this._pairings$, this._sourceClusterId$)
      .subscribe(([policyFormValues, pairings, sourceClusterId]) => {
      if (policyFormValues && (!sourceClusterId || sourceClusterId === 0)) {
        this.policyForm.patchValue(policyFormValues);
        this.selectedHdfsPath = policyFormValues['directories'];
      } else if (sourceClusterId > 0) {
        this.policyForm.patchValue({
          general: {
            sourceCluster: sourceClusterId
          }
        });
      }
    });
    this.policyForm.patchValue({
      job: {
        endTime: {
          time: moment(this.defaultTime).toDate()
        },
        startTime: {
          time: moment(this.defaultTime).toDate()
        }
      }
    });
    this.subscriptions.push(policyFormValuesSubscription);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pairings']) {
      this._pairings$.next(this.pairings);
    }
    if (changes['sourceClusterId']) {
      this._sourceClusterId$.next(this.sourceClusterId);
    }
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

  handleSubmit({ value }) {
    if (this.policyForm.valid) {
      if (value.job.repeatMode === this.policyRepeatModes.EVERY) {
        value.job.frequencyInSec = this.frequencyMap[value.job.unit] * value.job.frequency;
      }
      console.log(value);
      this.formSubmit.emit(value);
    }
    markAllTouched(this.policyForm);
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

  handleDayChange(radioItem: RadioItem) {
    const { value } = radioItem;
    this.policyForm.patchValue({
      job: {
        day: value
      }
    });
  }


  handleSourceClusterChange(sourceCluster: SelectOption) {
    this.selectedHdfsPath = this.root;
    this.policyForm.patchValue({
      general: {
        destinationCluster: ''
      }
    });
    this.selectedSource$.next(sourceCluster.value);
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

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
