/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, SimpleChanges, OnDestroy, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, AsyncValidatorFn, ValidationErrors
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { go } from '@ngrx/router-store';
import { IMyOptions, IMyDateModel } from 'mydatepicker';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { RadioItem } from 'common/radio-button/radio-button';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { POLICY_TYPES, POLICY_SUBMIT_TYPES, POLICY_REPEAT_MODES, POLICY_TIME_UNITS,
  POLICY_DAYS, POLICY_START} from 'constants/policy.constant';
import { getFormValues } from 'selectors/form.selector';
import { markAllTouched } from 'utils/form-util';
import { getDatePickerDate } from 'utils/date-util';
import { TranslateService } from '@ngx-translate/core';
import { mapToList } from 'utils/store-util';
import { simpleSearch } from 'utils/string-utils';
import { loadFullDatabases } from 'actions/hivelist.action';
import { resetFormValue } from 'actions/form.action';
import { getAllDatabases } from 'selectors/hive.selector';
import { HiveDatabase } from 'models/hive-database.model';
import { SelectOption } from 'components/forms/select-field';
import { TimeZoneService } from 'services/time-zone.service';
import { isEmpty } from 'utils/object-utils';
import * as moment from 'moment';
import { FILE_TYPES } from 'constants/hdfs.constant';
import { HdfsService } from 'services/hdfs.service';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';

export const POLICY_FORM_ID = 'POLICY_FORM_ID';
const DATABASE_REQUEST = '[Policy Form] DATABASE_REQUEST';

export function freqValidator(frequencyMap): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const parent = control.parent;
    if (!parent || !isInteger(control.value)) {
      return null;
    }
    const unit = parent.controls['unit'].value;
    const value = frequencyMap[unit] * control.value;
    // 2147472000 - 24855 days in seconds. closest days number to integer size
    return value < 2147472000 ? null : {'freqValidator': {name: control.value}};
  };
}

function isInteger(value: string): boolean {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0;
}

export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const {value} = control;
    if (!value) {
      return null;
    }
    return isInteger(value) ? null : {'integerValidator': {name: value}};
  };
}

export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const {value} = control;
    if (!value) {
      return null;
    }
    if (!value.trim() || !/^[A-Za-z0-9 _\-]*$/.test(value)) {
      return {'nameValidator': {name: value}};
    }
    return null;
  };
}

export function pathValidator(hdfsService): AsyncValidatorFn {
  let validationRequestTimeout;
  return (control: AbstractControl): Promise<ValidationErrors> => {
    if (validationRequestTimeout) {
      clearTimeout(validationRequestTimeout);
    }
    return new Promise((resolve, reject) => {
      validationRequestTimeout = setTimeout(() => {
        if (!control.value) {
          return resolve(null);
        }
        const clusterId = control.parent['controls']['general'].controls.sourceCluster.value;
        return hdfsService.getFilesList(clusterId, control.value).toPromise()
          .then(response => {
            const files = response.fileList;
            if (files.length && files[0].type === FILE_TYPES.FILE && files[0].pathSuffix === '') {
              return resolve({isFile: true});
            }
            return resolve(null);
          })
          .catch(_ => resolve({notExist: true}));
      }, 500);
    });
  };
}

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
  policyStart = POLICY_START;
  policyForm: FormGroup;
  selectedSource$ = new BehaviorSubject(0);
  sourceDatabases$: Observable<HiveDatabase[]>;
  databaseSearch$ = new BehaviorSubject<string>('');
  databaseRequest$: Observable<ProgressState>;
  subscriptions: Subscription[] = [];
  policyFormValues$;
  databaseListGroup: FormGroup;
  _pairings$: BehaviorSubject<Pairing[]> = new BehaviorSubject([]);
  _sourceClusterId$: BehaviorSubject<number> = new BehaviorSubject(0);
  freqRequired = {fieldLabel: 'Frequency'};
  freqLimit = {fieldLabel: 'Frequency'};
  directoryField = {fieldLabel: 'Folder path'};
  maxBandwidthField = {fieldLabel: 'Maximum Bandwidth'};
  userTimezone = '';
  get datePickerOptions(): IMyOptions {
    const yesterday = moment().subtract(1, 'day');
    const today = moment();
    return {
      dateFormat: 'yyyy-mm-dd',
      disableUntil: getDatePickerDate(yesterday),
      showTodayBtn: false,
      markCurrentDay: false,
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
  startOptions = <RadioItem[]> [
    {
      label: this.t.instant('page.policies.form.fields.start.schedule'),
      value: this.policyStart.ON_SCHEDULE
    },
    {
      label: this.t.instant('page.policies.form.fields.start.start_now'),
      value: this.policyStart.START_NOW
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
  selectedStart = this.policyStart.ON_SCHEDULE;
  root = '/';
  hdfsRootPath = '/';
  selectedHdfsPath = '/';
  userTimeZone$: BehaviorSubject<any>;
  get defaultTime(): Date {
    const date = moment();
    date.hours(0);
    date.minutes(0);
    date.seconds(0);
    return date.toDate();
  }

  get defaultEndTime(): Date {
    const date = moment();
    date.hours(23);
    date.minutes(59);
    date.seconds(59);
    return date.toDate();
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

  get startOption() {
    return this.policyForm.value.job.start;
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

  getEndTime(endDate) {
    const date = moment(endDate).toDate();
    date.setHours(23, 59, 59);
    return new Date(date);
  }

  constructor(private formBuilder: FormBuilder,
              private store: Store<State>,
              private timezoneService: TimeZoneService,
              private t: TranslateService,
              private cdRef: ChangeDetectorRef,
              private hdfs: HdfsService) { }

  // todo: to Denys. This method looks quite scary. Things to improve:
  // - split code into self-descriptive methods
  // - revisit logic around observables
  // - simplify overall logic
  ngOnInit() {
    this.userTimeZone$ = this.timezoneService.userTimezoneIndex$;
    this.userTimeZone$.subscribe((value) =>
      this.userTimezone = this.timezoneService.userTimezone ? this.timezoneService.userTimezone.label : '');
    const loadDatabasesSubscription = this.selectedSource$
      .filter(sourceCluster => !!sourceCluster)
      .subscribe(sourceCluster => {
        this.store.dispatch(loadFullDatabases(sourceCluster, {requestId: DATABASE_REQUEST}));
      });
    const databases$ = this.selectedSource$.switchMap(sourceCluster => {
      return this.store.select(getAllDatabases)
        .map(databases => databases.filter(db => db.clusterId === sourceCluster))
        .do(databases => {
          const selectedDatabase = this.policyForm.value.databases;
          const selectedSource = this.policyForm.value.general.sourceCluster;
          // select first database when source changed and selected database is not exist on selected cluster
          if (databases.length && !databases.some(db => db.clusterId === selectedSource && db.name === selectedDatabase)) {
            this.policyForm.patchValue({databases: databases[0].name});
          }
        });
      });
    this.sourceDatabases$ = Observable.combineLatest(this.databaseSearch$, databases$)
      .map(([searchPattern, databases]) => databases.filter(db => simpleSearch(db.name, searchPattern)));
    this.policyForm = this.formBuilder.group({
      general: this.formBuilder.group({
        name: ['', Validators.compose([Validators.required, Validators.maxLength(64), nameValidator()])],
        description: ['', Validators.maxLength(512)],
        type: [this.selectedPolicyType],
        sourceCluster: ['', Validators.required],
        destinationCluster: ['', Validators.required]
      }),
      databases: ['', Validators.required],
      directories: ['', Validators.compose([Validators.required]), pathValidator(this.hdfs)],
      job: this.formBuilder.group({
        start: this.policyStart.ON_SCHEDULE,
        repeatMode: this.policyRepeatModes.EVERY,
        frequency: ['', Validators.compose([Validators.required, freqValidator(this.frequencyMap), integerValidator()])],
        day: this.policyDays.MONDAY,
        frequencyInSec: 0,
        unit: this.policyTimeUnits.DAYS,
        schedule: this.policySubmitTypes.SCHEDULE,
        endTime: this.formBuilder.group({
          date: [''],
          time: [this.defaultEndTime]
        }, { validator: this.validateTime }),
        startTime: this.formBuilder.group({
          date: [''],
          time: [this.defaultTime]
        }, { validator: this.validateTime })
      }),
      advanced: this.formBuilder.group({
        queue_name: [''],
        max_bandwidth: ['', integerValidator()]
      }),
      userTimezone: ['']
    });
    const jobControls = this.policyForm.controls['job']['controls'];
    this.subscriptions.push(jobControls['unit'].valueChanges.subscribe(() => jobControls['frequency'].updateValueAndValidity()));
    this.activateFieldsForType(this.selectedPolicyType);
    this.policyFormValues$ = this.store.select(getFormValues(POLICY_FORM_ID));
    const policyFormValuesSubscription = Observable
      .combineLatest(this.policyFormValues$, this._pairings$, this._sourceClusterId$)
      .subscribe(([policyFormValues, pairings, sourceClusterId]) => {
        if (!isEmpty(policyFormValues) && (!sourceClusterId || sourceClusterId === 0)) {
          this.policyForm.patchValue(policyFormValues);
          this.selectedHdfsPath = policyFormValues['directories'];
          this.selectedSource$.next(policyFormValues['general']['sourceCluster']);
          this.activateFieldsForType(policyFormValues['general']['type']);
          if (Object.keys(policyFormValues['advanced']).some(k => policyFormValues['advanced'][k] !== '')) {
            this.sectionCollapsedMap.advanced = false;
          }
        } else if (sourceClusterId > 0) {
          this.policyForm.patchValue({
            general: {
              sourceCluster: sourceClusterId
            }
          });
          this.selectedSource$.next(sourceClusterId);
        }
      });
    this.policyForm.patchValue({
      job: {
        endTime: {
          time: moment(this.defaultEndTime).toDate()
        },
        startTime: {
          time: moment(this.defaultTime).toDate()
        }
      }
    });

    const directoriesChangesSubscription = this.policyForm.valueChanges
      .map(values => values.directories)
      .distinctUntilChanged()
      .debounceTime(500)
      .switchMap(value => {
        return this.policyForm.statusChanges
          .filter(_ => this.policyForm.get('directories').valid)
          .map(_ => value);
      })
      .subscribe(path => {
        this.hdfsRootPath = path;
        this.cdRef.detectChanges();
      });

    this.databaseRequest$ = this.store.select(getMergedProgress(DATABASE_REQUEST));
    this.subscriptions.push(loadDatabasesSubscription);
    this.subscriptions.push(policyFormValuesSubscription);
    this.subscriptions.push(directoriesChangesSubscription);
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
              label: `${cluster.name} (${cluster.dataCenter})`,
              value: cluster.id
            }
          });
        }, {});
      };
      return Object.assign({}, entities, getClusters(entity));
    }, {});
  }

  handleSubmit({ value }) {
    const userTimezone = this.timezoneService.userTimezone;
    if (this.policyForm.valid) {
      if (value.job.repeatMode === this.policyRepeatModes.EVERY) {
        value.job.frequencyInSec = this.frequencyMap[value.job.unit] * value.job.frequency;
        // Modify the start date to next day chosen if unit is "weeks"
        if (value.job.unit === this.policyTimeUnits.WEEKS) {
          const dayToLook = +value.job.day;
          const startDate = value.job.startTime.date;
          // if we haven't yet passed the day of the week:
          if (moment(startDate).isoWeekday() <= dayToLook) {
            value.job.startTime.date = moment(startDate).isoWeekday(dayToLook).format('YYYY-MM-DD');
          } else {
            // otherwise, get next week's instance of that day
            value.job.startTime.date = moment(startDate).add(1, 'weeks').isoWeekday(dayToLook).format('YYYY-MM-DD');
          }
        }
        if (value.job.endTime && 'date' in value.job.endTime) {
          const endDate = value.job.endTime.date;
          value.job.endTime.time = this.getEndTime(endDate);
        }
      }
      if (value.job.start === this.policyStart.START_NOW) {
        value.job.startTime.date = '';
        value.job.startTime.time = '';
      }
      value.userTimezone =  userTimezone ? userTimezone.label : '';
      this.formSubmit.emit(value);
    }
    markAllTouched(this.policyForm);
  }

  handleSearchChange(value: string) {
    this.databaseSearch$.next(value);
  }

  handleStartChange(radioItem) {
    const { value } = radioItem;
    this.policyForm.patchValue({
      job: {
        start: value,
        startTime: {
          time: moment(this.defaultTime).toDate()
        }
      }
    });
    if (value === this.policyStart.START_NOW) {
      const userTimezone = this.timezoneService.userTimezone;
      const day = userTimezone ? moment().tz(userTimezone.zones[0].value).format('d') : moment().format('d');
      this.policyForm.patchValue({
        job: {
          day: day
        }
      });
    }
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
    this.activateFieldsForType(value);
    this.databaseSearch$.next('');
  }

  activateFieldsForType(policyType: string) {
    let disableField,
        enableField;
    if (policyType === POLICY_TYPES.HDFS) {
      disableField = 'databases';
      enableField  = 'directories';
    } else if (policyType === POLICY_TYPES.HIVE) {
      disableField = 'directories';
      enableField = 'databases';
    }
    this.policyForm.get(enableField).enable();
    this.policyForm.get(disableField).disable();
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
    this.store.dispatch(resetFormValue(POLICY_FORM_ID));
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
    if (dateFieldValue && this.startOption === this.policyStart.ON_SCHEDULE) {
      const mDate = moment(dateFieldValue);
      if (this.policyForm && this.policyForm.controls['job']['controls'].unit) {
        const jobControls = this.policyForm.controls['job']['controls'];
        const unit = jobControls.unit.value;
        if (unit === this.policyTimeUnits.WEEKS) {
          const startTimeDay = mDate.day();
          const scheduledDay = jobControls.day.value;
          if (scheduledDay > startTimeDay) {
            mDate.add(scheduledDay - startTimeDay, 'days'); // first day will be on this week
          } else {
            mDate.add(7 - scheduledDay, 'days'); // first day will be on next week
          }
        }
      }
      const dateWithTime = this.setTimeForDate(mDate.format(), timeFieldValue);
      if (dateWithTime.isBefore(moment())) {
        timeControl.setErrors({ lessThanCurrent: true });
        return null;
      }
    }
    return null;
  }

  private setTimeForDate(date: string, time: string) {
    const dateValue = moment(date);
    const timeValue = new Date(time);
    dateValue.hours(timeValue.getHours());
    dateValue.minutes(timeValue.getMinutes());
    dateValue.seconds(0);
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
