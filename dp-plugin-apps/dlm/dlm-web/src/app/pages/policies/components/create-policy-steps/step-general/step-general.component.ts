/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup, Validators, FormBuilder, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { POLICY_TYPES } from 'constants/policy.constant';
import { RadioItem } from 'common/radio-button/radio-button';
import { TranslateService } from '@ngx-translate/core';

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

@Component({
  selector: 'dlm-step-general',
  templateUrl: './step-general.component.html',
  styleUrls: ['./step-general.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepGeneralComponent implements OnInit, OnDestroy, StepComponent {

  @Output() onFormValidityChange = new EventEmitter<boolean>();
  @HostBinding('class') className = 'dlm-step-general';

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
  selectedPolicyType = POLICY_TYPES.HDFS;
  form: FormGroup;

  constructor(private store: Store<State>, private formBuilder: FormBuilder, private t: TranslateService) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(64), nameValidator()])],
      description: ['', Validators.maxLength(256)],
      type: [this.selectedPolicyType],
    });
  }

  ngOnInit() {
    this.form = this.initForm();
    this.form.valueChanges.map(_ => this.isFormValid()).distinctUntilChanged()
      .subscribe(isFormValid => this.onFormValidityChange.emit(isFormValid));
  }

  ngOnDestroy() {

  }

  isFormValid() {
    return this.form.valid;
  }

  getFormValue() {
    return this.form.value;
  }

  isHDFSPolicy() {
    return this.form.value.type === POLICY_TYPES.HDFS;
  }
}
