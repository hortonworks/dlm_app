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
  Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, ChangeDetectionStrategy, OnDestroy, ViewChild, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { CloudContainer } from 'models/cloud-container.model';
import { CloudAccount } from 'models/cloud-account.model';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { Cluster } from 'models/cluster.model';
import { Step, CreatePolicyFormState } from 'models/wizard.model';
import { getAllSteps, getEntities } from 'selectors/create-policy.selector';
import { getStepById, addCloudPrefix } from 'utils/policy-util';
import { WIZARD_STEP_ID, WIZARD_STATE, SOURCE_TYPES, POLICY_TYPES, TDE_KEY_TYPE } from 'constants/policy.constant';
import { wizardSaveStep, wizardMoveToStep, createPolicy } from 'actions/policy.action';
import { StepGeneralComponent } from '../create-policy-steps/step-general/step-general.component';
import { StepSourceComponent } from '../create-policy-steps/step-source/step-source.component';
import { StepDestinationComponent } from '../create-policy-steps/step-destination/step-destination.component';
import { StepScheduleComponent } from '../create-policy-steps/step-schedule/step-schedule.component';
import { StepAdvancedComponent } from '../create-policy-steps/step-advanced/step-advanced.component';
import { TimeZoneService } from 'services/time-zone.service';
import * as moment from 'moment-timezone';
import { PolicyDefinition } from 'models/policy.model';
import { PolicyService } from 'services/policy.service';
import { omitEmpty } from 'utils/object-utils';
import { getProgressState } from 'selectors/progress.selector';
import { ProgressState } from 'models/progress-state.model';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { truncate } from 'pipes/truncate.pipe';
import { TranslateService } from '@ngx-translate/core';
import { getUnderlyingHiveFS } from 'utils/cluster-util';
import { UnderlyingFsForHive } from 'models/beacon-config-status.model';
import { AsyncActionsService } from 'services/async-actions.service';
import { SourceValue, DestinationValue, StepAdvancedValue } from 'models/create-policy-form.model';

const CREATE_POLICY_REQUEST = 'CREATE_POLICY';

@Component({
  selector: 'dlm-create-policy-wizard',
  templateUrl: './create-policy-wizard.component.html',
  styleUrls: ['./create-policy-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePolicyWizardComponent implements OnInit, AfterViewInit, OnDestroy {
  wizardSteps$: Observable<Step[]>;
  wizardStepsMap$: Observable<any>;
  wizardStepsSubscription: Subscription;
  wizardStepsMapSubscription: Subscription;
  activeStepId: string;
  _steps: Step[] = null;
  _stepsMap = null;
  WIZARD_STEP_ID = WIZARD_STEP_ID;
  isFormValid: true;
  creationState: ProgressState;
  subscriptions: Subscription[] = [];
  policyRequestInProgress = false;

  @Input() pairings: Pairing[] = [];
  @Input() accounts: CloudAccount[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() sourceClusterId = 0;
  @Output() onCancel = new EventEmitter<any>();
  @ViewChild('general') general: StepGeneralComponent;
  @ViewChild('source') source: StepSourceComponent;
  @ViewChild('destination') destination: StepDestinationComponent;
  @ViewChild('schedule') schedule: StepScheduleComponent;
  @ViewChild('advanced') advanced: StepAdvancedComponent;
  @HostBinding('class') className = 'dlm-create-policy-wizard';

  viewChildStepIdMap = {};

  get getNextButtonText() {
    let nextButtonText = '';
    if (this.activeStepId !== null) {
      const nextStepId = getStepById(this._steps, this.activeStepId).nextStepId;
      nextButtonText = nextStepId !== null ? getStepById(this._steps, nextStepId).label : 'Create Policy';
    }
    return nextButtonText;
  }

  get isBackButtonDisabled() {
    if (this.policyRequestInProgress) {
      return true;
    }
    let isBackButtonDisabled = false;
    if (this.activeStepId !== null) {
      isBackButtonDisabled = getStepById(this._steps, this.activeStepId).previousStepId === null;
    }
    return isBackButtonDisabled;
  }

  handleFormValidityChange(isValid) {
    this.isFormValid = isValid;
  }

  constructor(private store: Store<State>,
              private timeZone: TimeZoneService,
              private t: TranslateService,
              private asyncActions: AsyncActionsService,
              private cdRef: ChangeDetectorRef) {
    this.subscriptions.push(store
      .select(getProgressState(CREATE_POLICY_REQUEST))
      .subscribe((progressState: ProgressState) => this.creationState = progressState));
  }

  ngOnInit() {
    this.wizardSteps$ = this.store.select(getAllSteps);
    this.wizardStepsMap$ = this.store.select(getEntities);
    this.wizardStepsSubscription = this.wizardSteps$.subscribe(steps => {
      this._steps = steps;
      if (steps && steps.length) {
        const activeIndex = steps.findIndex(step => step.state === WIZARD_STATE.ACTIVE);
        if (steps[activeIndex]) {
          this.activeStepId = steps[activeIndex].id;
        }
      }
    });
    this.wizardStepsMapSubscription = this.wizardStepsMap$.subscribe(stepsMap => this._stepsMap = stepsMap);
  }

  ngAfterViewInit() {
    this.viewChildStepIdMap = {
      [this.WIZARD_STEP_ID.GENERAL]: this.general,
      [this.WIZARD_STEP_ID.SOURCE]: this.source,
      [this.WIZARD_STEP_ID.DESTINATION]: this.destination,
      [this.WIZARD_STEP_ID.SCHEDULE]: this.schedule,
      [this.WIZARD_STEP_ID.ADVANCED]: this.advanced
    };
  }

  ngOnDestroy() {
    this.wizardStepsSubscription.unsubscribe();
    this.wizardStepsMapSubscription.unsubscribe();
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  handleNextButtonClick(event) {
    const lastStepSubmit = this.activeStepId === this.WIZARD_STEP_ID.ADVANCED;
    this.store.dispatch(wizardSaveStep(this.activeStepId, this.viewChildStepIdMap[this.activeStepId].getFormValue()));
    if (this.activeStepId === this.WIZARD_STEP_ID.SOURCE) {
      this.source.validatePreselectedCluster();
    }
    if (lastStepSubmit) {
      this.submitPolicy();
    }
  }

  submitPolicy() {
    const formsData: CreatePolicyFormState = this._stepsMap;
    const {
      general: {value: general},
      source: {value: {source}},
      destination: {value: {destination}},
      schedule: {value: {job: schedule}}
    } = formsData;

    // This will guarantee that the advanced settings information is always the latest
    const {advanced}: StepAdvancedValue = this.viewChildStepIdMap[this.activeStepId].getFormValue();

    const policyData = {
      policyDefinition: <PolicyDefinition>{
        type: general.type,
        name: general.name,
        description: general.description,
        sourceDataset: '',
        sourceCluster: '',
        targetCluster: '',
        targetDataset: '',
        repeatMode: schedule.repeatMode,
        frequencyInSec: schedule.frequencyInSec,
        startTime: this.formatDateValue(schedule.startTime),
        endTime: this.formatDateValue(schedule.endTime),
        queueName: advanced.queue_name,
        distcpMapBandwidth: null,
        cloudCred: ''
      }
    };

    if (source['setSnapshottable']) {
      policyData.policyDefinition['source.setSnapshottable'] = true;
    }

    let clusterId;
    const sc = this.clusters.find(c => c.id === source.cluster);
    const dc = this.clusters.find(c => c.id === destination.cluster);
    const isHiveCloud = general.type === POLICY_TYPES.HIVE && getUnderlyingHiveFS(dc) === UnderlyingFsForHive.S3;

    if (destination.type === SOURCE_TYPES.CLUSTER) {
      clusterId = isHiveCloud ? sc.id : dc.id;
      policyData.policyDefinition.targetCluster = PolicyService.makeClusterId(dc.dataCenter, dc.name);
      policyData.policyDefinition.targetDataset = destination.path;
      if (isHiveCloud) {
        policyData.policyDefinition.cloudCred = destination.cloudAccount;
      }
    } else {
      clusterId = sc.id;
      if (destination.type === SOURCE_TYPES.S3) {
        // destination s3
        policyData.policyDefinition.targetDataset = addCloudPrefix(destination.s3endpoint);
        policyData.policyDefinition.cloudCred = destination.cloudAccount;
      }
    }

    if (source.type === SOURCE_TYPES.CLUSTER) {
      // source cluster
      let sourceDataset = '';
      policyData.policyDefinition.sourceCluster = PolicyService.makeClusterId(sc.dataCenter, sc.name);
      if (general.type === POLICY_TYPES.HDFS) {
        sourceDataset = source.directories;
      } else if (general.type === POLICY_TYPES.HIVE) {
        sourceDataset = source.databases;
      }
      policyData.policyDefinition.sourceDataset = sourceDataset;
    } else {
      if (source.type === SOURCE_TYPES.S3) {
        // source s3
        policyData.policyDefinition.sourceDataset = addCloudPrefix(source.s3endpoint);
        policyData.policyDefinition.cloudCred = source.cloudAccount;
      }
    }

    if (source.type === SOURCE_TYPES.CLUSTER && source.type === destination.type) {
      if (destination.tdeKey === TDE_KEY_TYPE.SAME_KEY) {
        policyData.policyDefinition['tde.sameKey'] = true;
      }
    }

    if (advanced.max_bandwidth) {
      policyData.policyDefinition.distcpMapBandwidth = Number(advanced.max_bandwidth);
    }

    if (source.type === SOURCE_TYPES.S3 && !!source.cloudEncryption) {
      const cloudEncryptionTarget: SourceValue = source || {} as SourceValue;
      policyData.policyDefinition['cloud.encryptionAlgorithm'] = cloudEncryptionTarget.cloudEncryption;
    } else if (destination.type === SOURCE_TYPES.S3 && !!destination.cloudEncryption) {
      const cloudEncryptionTarget: DestinationValue = destination || {} as DestinationValue;
      policyData.policyDefinition['cloud.encryptionAlgorithm'] = cloudEncryptionTarget.cloudEncryption;
      policyData.policyDefinition['cloud.encryptionKey'] = cloudEncryptionTarget.cloudEncryptionKey;
    }

    policyData.policyDefinition = <PolicyDefinition>omitEmpty(policyData.policyDefinition);

    const notification = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        title: this.t.instant('page.policies.success.title'),
        body: this.t.instant('page.policies.success.body', {
          policyName: truncate(policyData.policyDefinition.name, 25)
        })
      },
      [NOTIFICATION_TYPES.ERROR]: {}
    };
    const meta = {
      requestId: CREATE_POLICY_REQUEST,
      notification
    };
    this.policyRequestInProgress = true;
    this.asyncActions.dispatch(createPolicy(policyData, clusterId, meta))
      .subscribe(() => this.policyRequestInProgress = false);
  }

  formatDateValue(timeField, timezone = true) {
    if (!timeField.date) {
      return null;
    }
    const dateTime = moment(timeField.date);
    const time = new Date(timeField.time);
    dateTime.hours(time.getHours());
    dateTime.minutes(time.getMinutes());
    dateTime.seconds(time.getSeconds());
    return timezone ? dateTime.tz(this.timeZone.defaultServerTimezone).format() : dateTime.format();
  }

  handleBackButtonClick(event) {
    if (!this.isBackButtonDisabled && this.activeStepId !== null) {
      const previousStepId = getStepById(this._steps, this.activeStepId).previousStepId;
      // Handle form valid state by setting it to the previous step's form valid state
      this.updateFormValidStateTo(previousStepId);
      this.store.dispatch(wizardMoveToStep(previousStepId));
      this.cdRef.detectChanges();
    }
  }

  handleCancelClick(event) {
    this.onCancel.emit(true);
  }

  handleSelectTab(tab, step: Step) {
    // workaround to handle actual tab change instead of native select event
    if ('tabset' in tab) {
      // Handle form valid state by setting it to the selected step's form valid state
      this.updateFormValidStateTo(step.id);
      this.store.dispatch(wizardMoveToStep(step.id));
    }
  }

  updateFormValidStateTo(stepId: string) {
    this.handleFormValidityChange(this.viewChildStepIdMap[stepId].isFormValid());
  }

  trackByFn(step: Step): string {
    return step.id;
  }
}
