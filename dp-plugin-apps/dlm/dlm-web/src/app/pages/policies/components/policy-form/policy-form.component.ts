import { Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { go } from '@ngrx/router-store';
import { IMyOptions, IMyDateModel } from 'mydatepicker';

import { RadioItem } from 'common/radio-button/radio-button';
import { createPolicy } from 'actions/policy.action';
import { State } from 'reducers/index';
import { Observable } from 'rxjs/Observable';
import { Pairing } from 'models/pairing.model';
import { SessionStorageService } from 'services/session-storage.service';
import { POLICY_TYPES, POLICY_SUBMIT_TYPES } from 'constants/policy.constant';
import { markAllTouched } from 'utils/form-util';
import { getDatePickerDate } from 'utils/date-util';
import {TranslateService} from '@ngx-translate/core';

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
export class PolicyFormComponent implements OnInit {
  @Input() pairings: Pairing[] = [];
  @Output() formSubmit = new EventEmitter<any>();
  @HostBinding('class') className = 'dlm-policy-form';
  policySubmitTypes = POLICY_SUBMIT_TYPES;
  policyForm: FormGroup;
  databaseListGroup: FormGroup;
  // todo: this mock and should be removed!
  dbList = Array(6).fill(null).map((i, id) => `db_${id}`);
  visibleDbList = this.dbList;
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

  get pairs() {
    return this.generatePairs(this.pairings);
  }

  get clustersFromPair() {
    const pairId = this.policyForm.value.general.pair;
    let clusters = [];
    if (pairId) {
      const pair = this.pairings.filter(pairing => pairing.id === pairId)[0];
      clusters  = pair.pair.map(cluster => {
          return {
            label: cluster.name,
            value: cluster.id
          };
      });
    }
    return clusters;
  }

  get sourceCluster() {
    return this.policyForm.value.general.sourceCluster;
  }

  constructor(private formBuilder: FormBuilder, private store: Store<State>, private t: TranslateService) { }

  ngOnInit() {
    this.policyForm = this.formBuilder.group({
      general: this.formBuilder.group({
        name: ['', Validators.required],
        type: [this.selectedPolicyType],
        pair: [this.pairs.length && this.pairs[0].value || null, Validators.required],
        sourceCluster: ['', Validators.required]
      }),
      databases: [[]],
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
  }

  generatePairs(pairings: Pairing[]) {
    return pairings.reduce((pairs, pairing) => {
      return pairs.concat({
        value: pairing.id,
        label: [pairing.pair[0].name, pairing.pair[1].name]
      });
    }, []);
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
    let reg: RegExp;
    try {
      reg = new RegExp(value);
    } catch (e) {
      reg = new RegExp('');
    }
    this.visibleDbList = this.dbList.filter(name => reg.test(name));
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

  handlePairChange(pair) {
    this.policyForm.patchValue({
      general: {
        sourceCluster: ''
      }
    });
  }

  handleSourceClusterChange(sourceCluster) {
    this.selectedHdfsPath = this.hdfsRootPath;
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
