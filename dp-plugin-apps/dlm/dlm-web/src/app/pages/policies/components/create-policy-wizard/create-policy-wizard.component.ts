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
  HostBinding, ChangeDetectionStrategy, OnDestroy, ViewChild, AfterViewInit, ViewChildren, QueryList
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
import { Step } from 'models/wizard.model';
import { getAllSteps, getEntities } from 'selectors/create-policy.selector';
import { getStepById } from 'utils/policy-util';
import { WIZARD_STEP_ID, WIZARD_STATE, SOURCE_TYPES, POLICY_TYPES } from 'constants/policy.constant';
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

  @Input() pairings: Pairing[] = [];
  @Input() containers: any = {};
  @Input() accounts: CloudAccount[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() containersList: CloudContainer[] = [];
  @Input() beaconStatuses: BeaconAdminStatus[] = [];
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
    let isBackButtonDisabled = false;
    if (this.activeStepId !== null) {
      isBackButtonDisabled = getStepById(this._steps, this.activeStepId).previousStepId === null;
    }
    return isBackButtonDisabled;
  }

  handleFormValidityChange(isValid) {
    this.isFormValid = isValid;
  }

  constructor(private store: Store<State>, private timeZone: TimeZoneService, private t: TranslateService) {
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
    if (lastStepSubmit) {
      this.submitPolicy();
    }
  }

  submitPolicy() {
    const formsData = this._stepsMap;
    const {
      general: {value: general},
      source: {value: {source}},
      destination: {value: {destination}},
      schedule: {value: {job: schedule}},
      advanced: {value: advanced}
    } = formsData;

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
        distcpMapBandwidth: advanced.max_bandwidth,
        cloudCred: ''
      }
    };

    let clusterId;
    const sc = this.clusters.find(c => c.id === source.cluster);

    if (destination.type === SOURCE_TYPES.CLUSTER) {
      // destination cluster
      const dc = this.clusters.find(c => c.id === destination.cluster);
      clusterId = dc.id;
      policyData.policyDefinition.targetCluster = PolicyService.makeClusterId(dc.dataCenter, dc.name);
      if (general.type === POLICY_TYPES.HDFS) {
        policyData.policyDefinition.targetDataset = destination.path;
      }
    } else {
      clusterId = sc.id;
      if (destination.type === SOURCE_TYPES.S3) {
        // destination s3
        policyData.policyDefinition.targetDataset = destination.s3endpoint;
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
        policyData.policyDefinition.sourceDataset = source.s3endpoint;
        policyData.policyDefinition.cloudCred = source.cloudAccount;
      }
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
    this.store.dispatch(createPolicy(policyData, clusterId, meta));
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
    }
  }

  handleCancelClick(event) {
    this.onCancel.emit(true);
  }

  handleSelectTab(tab, step: Step) {
    // Handle form valid state by setting it to the selected step's form valid state
    this.updateFormValidStateTo(step.id);
    this.store.dispatch(wizardMoveToStep(step.id));
  }

  updateFormValidStateTo(stepId: string) {
    this.handleFormValidityChange(this.viewChildStepIdMap[stepId].isFormValid());
  }

  trackByFn(step: Step): string {
    return step.id;
  }
}
