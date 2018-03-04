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
import { POLICY_TYPES, WIZARD_STEP_ID } from 'constants/policy.constant';
import { getStep } from 'selectors/create-policy.selector';
import { TranslateService } from '@ngx-translate/core';
import { mapToList } from 'utils/store-util';
import { S3 } from 'constants/cloud.constant';

const CLUSTER = 'CLUSTER';

@Component({
  selector: 'dlm-step-destination',
  templateUrl: './step-destination.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepDestinationComponent implements OnInit, OnDestroy, StepComponent {

  @Input() pairings: Pairing[] = [];
  @Input() containers: any = {};
  @Input() accounts: CloudAccount[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() containersList: CloudContainer[] = [];
  @Output() onFormValidityChange = new EventEmitter<boolean>();
  @HostBinding('class') className = 'dlm-step-destination';

  CLUSTER = CLUSTER;
  S3 = S3;
  form: FormGroup;
  general: {};
  WIZARD_STEP_ID = WIZARD_STEP_ID;

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

  get destinationType() {
    return this.form.value.destination.type;
  }

  static clusterToListOption(cluster) {
    return {
      label: `${cluster.name} (${cluster.dataCenter})`,
      value: cluster.id
    };
  }

  constructor(private store: Store<State>, private formBuilder: FormBuilder, private t: TranslateService) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      destination: this.formBuilder.group({
        type: ['', Validators.required],
        cluster: [''],
        cloudAccount: [''],
        s3endpoint: ['']
      })
    });
  }

  ngOnInit() {
    this.form = this.initForm();
    this.store.select(getStep(this.WIZARD_STEP_ID.GENERAL)).subscribe(general => {
      this.general = general && 'value' in general ? general['value'] : {};
    });
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
}
