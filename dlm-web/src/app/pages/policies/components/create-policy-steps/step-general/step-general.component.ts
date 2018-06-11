/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
import { Subscription } from 'rxjs/Subscription';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { singleLineValidator } from 'utils/form-util';

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
  subscriptions: Subscription[] = [];

  constructor(private store: Store<State>,
              private formBuilder: FormBuilder,
              private t: TranslateService,
              private wizardService: PolicyWizardService) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(64), nameValidator()])],
      description: ['', Validators.compose([Validators.maxLength(256), singleLineValidator()])],
      type: [this.selectedPolicyType],
    });
  }

  ngOnInit() {
    this.form = this.initForm();
    this.subscriptions.push(this.wizardService.publishValidationStatus(this, this.form));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
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

  isHivePolicy() {
    return this.form.get('type').value === POLICY_TYPES.HIVE;
  }
}
