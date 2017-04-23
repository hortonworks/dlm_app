import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RadioItem } from '../../../../common/radio-button/radio-button';
import { createPolicy } from '../../../../actions/policy.action';
import { State } from '../../../../reducers/index';

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

  selectedJobType: string = this.jobTypes[0].value;

  constructor(private formBuilder: FormBuilder, private store: Store<State>) { }

  ngOnInit() {
    this.policyForm = this.formBuilder.group({
      general: this.formBuilder.group({
        name: '',
        type: [this.storageTypes[0].value],
        pair: '',
      }),
      databases: [],
      job: this.formBuilder.group({
        schedule: 'IMMEDIATE',
        time: ''
      })
    });
  }

  handleSubmit({ value }) {
    this.store.dispatch(createPolicy(value));
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
