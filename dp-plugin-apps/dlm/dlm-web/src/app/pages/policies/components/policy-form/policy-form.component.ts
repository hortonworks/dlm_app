import { Component, Output, OnInit, ViewEncapsulation, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RadioItem } from '../../../../common/radio-button/radio-button';
import { createPolicy } from '../../../../actions/policy.action';
import { State } from '../../../../reducers/index';
import { Observable } from 'rxjs/Observable';
import { SessionStorageService } from 'services/session-storage.service';

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
  @Output() formSubmit = new EventEmitter<any>();

  policyForm: FormGroup;
  databaseListGroup: FormGroup;
  // todo: this mock and should be removed!
  dbList = Array(6).fill(null).map((i, id) => `db_${id}`);
  visibleDbList = this.dbList;
  sectionCollapsedMap = {
    general: false,
    database: false,
    job: false
  };

  storageTypes = <RadioItem[]>[
    {
      label: 'HDFS',
      value: 'HDFS'
    },
    {
      label: 'HIVE',
      value: 'HIVE'
    }
  ];

  jobTypes = <RadioItem[]>[
    {
      label: 'One Time',
      value: 'IMMEDIATE'
    },
    {
      label: 'On Schedule',
      value: 'SCHEDULE'
    }
  ];

  // todo: this is mock. Instead should load pairings. `value` coma format is keeped from beacon api format
  pairs = [
    {
      value: 'primaryCluster,destinationCluster',
      label: 'Cluster 1 -> Cluster 2'
    },
    {
      value: 'primaryCluster,destinationCluster',
      label: 'Cluster 3 -> Cluster 4'
    }
  ];

  selectedJobType: string = this.jobTypes[0].value;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.policyForm = this.formBuilder.group({
      general: this.formBuilder.group({
        name: '',
        type: [this.storageTypes[0].value],
        pair: this.pairs[0].value
      }),
      databases: [[]],
      job: this.formBuilder.group({
        schedule: 'IMMEDIATE',
        time: ''
      })
    });
  }

  handleSubmit({ value }) {
    this.formSubmit.emit(value);
  }

  handleJobChange(radio: RadioItem) {
    this.selectedJobType = radio.value;
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
}
