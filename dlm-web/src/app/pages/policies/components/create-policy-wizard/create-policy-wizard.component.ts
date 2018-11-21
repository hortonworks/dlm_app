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
  HostBinding, ChangeDetectionStrategy, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription ,  combineLatest } from 'rxjs';
import { State } from 'reducers/index';
import { Pairing } from 'models/pairing.model';
import { CloudAccount } from 'models/cloud-account.model';
import { Cluster } from 'models/cluster.model';
import { Step, StepName, StepState, CreatePolicyFormState } from 'models/wizard.model';
import { getAllSteps, getEntities } from 'selectors/create-policy.selector';
import { getStepById } from 'utils/policy-util';
import { WIZARD_STEP_ID, WIZARD_STATE } from 'constants/policy.constant';
import {
  wizardSaveStep, wizardMoveToStep, createPolicy, wizardUpdateStepState, wizardSaveStepValue, updatePolicy,
  wizardResetAllSteps
} from 'actions/policy.action';
import { StepGeneralComponent } from '../create-policy-steps/step-general/step-general.component';
import { StepSourceComponent } from '../create-policy-steps/step-source/step-source.component';
import { StepDestinationComponent } from '../create-policy-steps/step-destination/step-destination.component';
import { StepScheduleComponent } from '../create-policy-steps/step-schedule/step-schedule.component';
import { StepAdvancedComponent } from '../create-policy-steps/step-advanced/step-advanced.component';
import { getValues, omit } from 'utils/object-utils';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { truncate } from 'pipes/truncate.pipe';
import { TranslateService } from '@ngx-translate/core';
import { AsyncActionsService } from 'services/async-actions.service';
import { SpinnerSize } from 'common/spinner';
import { tap, map, delay, take, concatMap } from 'rxjs/operators';
import { PolicyWizardService, IRoute } from 'services/policy-wizard.service';
import { Policy } from 'models/policy.model';
import * as RouterActions from 'actions/router.action';
import { contains } from 'utils/array-util';
import { ProgressState } from 'models/progress-state.model';

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
  subscriptions: Subscription[] = [];
  policyRequestInProgress = false;
  spinnerSize = SpinnerSize;
  isEditMode = false;
  policyAlreadyRun = false;

  @Input() pairings: Pairing[] = [];
  @Input() accounts: CloudAccount[] = [];
  @Input() clusters: Cluster[] = [];
  @Input() policy: Policy;
  @Input() sourceClusterId = 0;
  @Output() onCancel = new EventEmitter<any>();
  @ViewChild('general') general: StepGeneralComponent;
  @ViewChild('source') source: StepSourceComponent;
  @ViewChild('destination') destination: StepDestinationComponent;
  @ViewChild('schedule') schedule: StepScheduleComponent;
  @ViewChild('advanced') advanced: StepAdvancedComponent;
  @HostBinding('class') className = 'dlm-create-policy-wizard';

  viewChildStepIdMap = {};

  get getNextButtonText(): string {
    let nextButtonText = '';
    if (this.activeStepId !== null) {
      const nextStepId = getStepById(this._steps, this.activeStepId).nextStepId;
      nextButtonText = nextStepId !== null ? getStepById(this._steps, nextStepId).label :
        'page.policies.subpage.create_policy.buttons.create_policy';
    }
    if (this.isEditMode) {
      nextButtonText = 'page.policies.subpage.create_policy.buttons.save_policy';
    }
    return nextButtonText;
  }

  get switchStepButtonText(): string {
    return this.activeStepId === WIZARD_STEP_ID.SCHEDULE ?
      'page.policies.subpage.create_policy.buttons.edit_advanced_settings' :
      'page.policies.subpage.create_policy.buttons.edit_schedule';
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

  private serializeForm = map((formsData: CreatePolicyFormState) =>
    this.policyWizardService.serializePolicy(formsData, {clusters: this.clusters}));

  handleFormValidityChange(isValid) {
    this.isFormValid = isValid;
  }

  constructor(
    private store: Store<State>,
    private t: TranslateService,
    private asyncActions: AsyncActionsService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private policyWizardService: PolicyWizardService
  ) {
    this.wizardSteps$ = this.store.select(getAllSteps);
    this.wizardStepsMap$ = this.store.select(getEntities);
  }

  private selectStep() {
    const decodeParams = (params) => Object.keys(params).reduce((acc, p) => ({...acc, [p]: decodeURIComponent(params[p]) }), {});
    const mapParams = map(([_, params]: IRoute) => decodeParams(params));
    const getStep = map((params: any): StepName => params.step);
    const setWizardForms = tap(() => {
      const formsValue = this.policyWizardService.deserializePolicy(this.policy);
      Object.keys(formsValue).forEach(stepId => this.store.dispatch(wizardSaveStep(stepId as StepName, formsValue[stepId])));
    });
    const setupEditMode = combineLatest(this.route.url, this.route.params).pipe(
      this.policyWizardService.whenEditMode,
      delay(100), // give angular some time to compile child components
      setWizardForms,
      mapParams,
      getStep,
    ).subscribe(step => {
      this.isEditMode = true;
      this.store.dispatch(wizardMoveToStep(step));
      this.store.dispatch(wizardUpdateStepState.apply(this, ['disabled'].concat(getValues<StepName>(WIZARD_STEP_ID))));
      this.store.dispatch(wizardUpdateStepState('active', step));
    });
    this.subscriptions.push(setupEditMode);
  }

  private saveActiveStep(): void {
    this.store.dispatch(wizardSaveStep(this.activeStepId as StepName, this.viewChildStepIdMap[this.activeStepId].getFormValue()));
  }

  private setupEditMode(): void {
    if (this.policy) {
      this.policyAlreadyRun = this.policyWizardService.isPolicyAlreadyRun(this.policy);
    }
  }


  private updatePolicy() {
    this.policyRequestInProgress = true;
    this.wizardStepsMap$.pipe(
      take(1),
      this.serializeForm,
      concatMap(formsData => {
        let updatePayload = this.policyWizardService.mapUpdatePayload(formsData);
        if (this.policyAlreadyRun) {
          updatePayload = omit(updatePayload, 'startTime');
        }
        const notification = {
          [NOTIFICATION_TYPES.SUCCESS]: {
            title: this.t.instant('page.policies.notifications.update.success.title'),
            body: this.t.instant('page.policies.notifications.update.success.body', {
              policyName: truncate(this.policy.name, 25)
            })
          },
          [NOTIFICATION_TYPES.ERROR]: {
            title: this.t.instant('page.policies.notifications.update.error.title')
          }
        };
        const meta = {
          notification
        };
        return this.asyncActions.dispatch(updatePolicy(this.policy, updatePayload, meta));
      })
    ).subscribe(progressState => {
      this.redirectOnSave(progressState);
      this.policyRequestInProgress = false;
    });
  }

  private activatedStep(stepName: StepName): boolean {
    return this.activeStepId === stepName;
  }

  private redirectOnSave(progressState: ProgressState): void {
    if (progressState.success) {
      this.store.dispatch(wizardResetAllSteps());
      this.store.dispatch(new RouterActions.Go({path: ['/policies']}));
    }
  }

  ngOnInit() {
    this.selectStep();
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
    this.setupEditMode();
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
    if (this.isEditMode) {
      this.store.dispatch(wizardSaveStepValue(this.activeStepId as StepName, this.viewChildStepIdMap[this.activeStepId].getFormValue()));
      this.updatePolicy();
      return;
    }
    const lastStepSubmitted = this.activatedStep(WIZARD_STEP_ID.ADVANCED);
    this.saveActiveStep();
    this.scrollToTop();
    if (this.activatedStep(WIZARD_STEP_ID.SOURCE)) {
      this.source.validatePreselectedCluster();
    }
    if (lastStepSubmitted) {
      this.submitPolicy();
    }
  }

  submitPolicy() {
    this.policyRequestInProgress = true;
    this.wizardStepsMap$.pipe(
      take(1),
      this.serializeForm,
      concatMap(({policyData, clusterId}) => {
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
          notification
        };
        return this.asyncActions.dispatch(createPolicy(policyData, clusterId, meta));
      })
    )
    .subscribe(progressState => {
      this.redirectOnSave(progressState);
      this.policyRequestInProgress = false;
    });
  }

  handleSwitchStep(event): void {
    let nextStep: StepName = WIZARD_STEP_ID.ADVANCED;
    if (this.activatedStep(WIZARD_STEP_ID.ADVANCED)) {
      nextStep = WIZARD_STEP_ID.SCHEDULE;
    }
    this.saveActiveStep();
    this.store.dispatch(wizardMoveToStep(nextStep));
  }

  handleBackButtonClick(event) {
    if (!this.isBackButtonDisabled && this.activeStepId !== null) {
      const previousStepId = getStepById(this._steps, this.activeStepId).previousStepId;
      // Handle form valid state by setting it to the previous step's form valid state
      this.updateFormValidStateTo(previousStepId);
      this.store.dispatch(wizardMoveToStep(previousStepId));
      this.cdRef.detectChanges();
      this.scrollToTop();
    }
  }

  scrollToTop() {
    // Scroll back to the top of the panel
    $('dlm-wizard-content .panel-content').animate({scrollTop: 0}, 300);
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
      this.scrollToTop();
    }
  }

  updateFormValidStateTo(stepId: string) {
    this.handleFormValidityChange(this.viewChildStepIdMap[stepId].isFormValid());
  }

  trackByFn(step: Step): string {
    return step.id;
  }

  isStepDisabled(step: Step): boolean {
    const supportEdit = [WIZARD_STEP_ID.SCHEDULE, WIZARD_STEP_ID.ADVANCED];
    // Disable all the steps except active step when policy is being submitted or saved
    if (this.policyRequestInProgress && step.state !== 'active') {
      return true;
    }
    if (this.isEditMode) {
      return !contains(supportEdit, step.id) || step.state === 'disabled';
    }
    return step.state === 'disabled';
  }

  stepClassName(step: Step): StepState {
    return this.isStepDisabled(step) ? 'disabled' : step.state;
  }
}
