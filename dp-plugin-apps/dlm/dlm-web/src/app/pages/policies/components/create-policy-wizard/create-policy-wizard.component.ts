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
import { getAllSteps } from 'selectors/create-policy.selector';
import { getStepById } from 'utils/policy-util';
import { WIZARD_STEP_ID, WIZARD_STATE } from 'constants/policy.constant';
import { wizardSaveStep, wizardMoveToStep } from 'actions/policy.action';
import { StepGeneralComponent } from '../create-policy-steps/step-general/step-general.component';
import { StepSourceComponent } from '../create-policy-steps/step-source/step-source.component';
import { StepDestinationComponent } from '../create-policy-steps/step-destination/step-destination.component';
import { StepScheduleComponent } from '../create-policy-steps/step-schedule/step-schedule.component';
import { StepAdvancedComponent } from '../create-policy-steps/step-advanced/step-advanced.component';

@Component({
  selector: 'dlm-create-policy-wizard',
  templateUrl: './create-policy-wizard.component.html',
  styleUrls: ['./create-policy-wizard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePolicyWizardComponent implements OnInit, AfterViewInit, OnDestroy {
  wizardSteps$: Observable<Step[]>;
  wizardStepsSubscription: Subscription;
  activeStepId: string;
  _steps: Step[] = null;
  WIZARD_STEP_ID = WIZARD_STEP_ID;
  isFormValid: true;

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
      nextButtonText =  nextStepId !== null ? getStepById(this._steps, nextStepId).label : 'Create Policy';
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

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.wizardSteps$ = this.store.select(getAllSteps);
    this.wizardStepsSubscription = this.wizardSteps$.subscribe(steps => {
      this._steps = steps;
      if (steps && steps.length) {
        const activeIndex = steps.findIndex(step => step.state === WIZARD_STATE.ACTIVE);
        this.activeStepId = steps[activeIndex].id;
      }
    });
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
  }

  handleNextButtonClick(event) {
    this.store.dispatch(wizardSaveStep(this.activeStepId, this.viewChildStepIdMap[this.activeStepId].getFormValue()));
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
