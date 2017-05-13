import { Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IMyOptions, IMyDateModel } from 'mydatepicker';

import { RadioItem } from 'common/radio-button/radio-button';
import { createPolicy } from 'actions/policy.action';
import { State } from 'reducers/index';
import { Observable } from 'rxjs/Observable';
import { Pairing } from 'models/pairing.model';
import { SessionStorageService } from 'services/session-storage.service';
import { POLICY_TYPES, POLICY_SUBMIT_TYPES } from 'constants/policy.constant';

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
  policySubmitTypes = POLICY_SUBMIT_TYPES;
  policyForm: FormGroup;
  databaseListGroup: FormGroup;
  // todo: this mock and should be removed!
  dbList = Array(6).fill(null).map((i, id) => `db_${id}`);
  visibleDbList = this.dbList;
  datePickerOptions: IMyOptions = {
    dateFormat: 'yyyy-mm-dd'
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
    {
      label: 'One Time',
      value: this.policySubmitTypes.SUBMIT
    },
    {
      label: 'On Schedule',
      value: this.policySubmitTypes.SCHEDULE
    }
  ];
  selectedJobType: string = this.jobTypes[0].value;

  get pairs() {
    return this.generatePairs(this.pairings);
  }


  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.policyForm = this.formBuilder.group({
      general: this.formBuilder.group({
        name: '',
        type: [this.storageTypes[0].value],
        pair: this.pairs.length && this.pairs[0].value
      }),
      databases: [[]],
      directories: '',
      job: this.formBuilder.group({
        schedule: this.policySubmitTypes.SUBMIT,
        frequencyInSec: 0,
        endTime: '',
        startTime: ''
      })
    });
  }

  generatePairs(pairings: Pairing[]) {
    return pairings.reduce((pairs, pairing) => {
      return pairs.concat({
        value: pairing.id,
        label: `${pairing.pair[0].name} <--> ${pairing.pair[1].name}`
      });
    }, []);
  }

  handleSubmit({ value }) {
    this.formSubmit.emit(value);
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
    this.policyForm.patchValue({ job: {[dateType]: `${date.formatted}T00:00:00`}});
  }
}
