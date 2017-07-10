import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import { EffectsTestingModule, EffectsRunner } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import { PolicyEffects } from './policy.effect';
import { JobService } from 'services/job.service';
import { PolicyService } from 'services/policy.service';
import { Observable } from 'rxjs/Observable';
import * as policyActions from 'actions/policy.action';
import * as operationActions from 'actions/operation.action';
import { Policy } from 'models/policy.model';
import { OperationResponse } from 'models/operation-response.model';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'services/notification.service';

describe('PolicyEffects', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      EffectsTestingModule
    ],
    providers: [
      PolicyEffects,
      {
        provide: TranslateService,
        useValue: jasmine.createSpyObj('t', ['instant'])
      },
      {
        provide: PolicyService,
        useValue: jasmine.createSpyObj('policyService', ['deletePolicy', 'suspendPolicy', 'resumePolicy'])
      },
      {
        provide: JobService,
        useValue: jasmine.createSpyObj('jobService', ['getJobsForPolicies'])
      },
      {
        provide: NotificationService,
        useValue: jasmine.createSpyObj('notificationService', ['create'])
      }
    ]
  }));

  function setup() {
    return {
      policyService: TestBed.get(PolicyService),
      runner: TestBed.get(EffectsRunner),
      policyEffects: TestBed.get(PolicyEffects)
    };
  }

  beforeEach(() => {
    this.policy1 = <Policy>{id: '1'};
    this.operationSuccess = <OperationResponse>{id: '1'};
  });

  describe('#deletePolicy$', () => {

    it('should return a new deletePolicySuccess and new operationComplete actions, on success', () => {
      const {policyService, runner, policyEffects} = setup();
      policyService.deletePolicy.and.returnValue(Observable.of(this.operationSuccess));
      const expectedDeleteSuccessAction = policyActions.deletePolicySuccess(this.policy1.id);
      const expectedOperationCompleteAction = operationActions.operationComplete(this.operationSuccess);
      runner.queue(policyActions.deletePolicy(this.policy1));

      policyEffects.deletePolicy$.pairwise().subscribe(([firstAction, secondAction]) => {
        expect(firstAction).toEqual(expectedDeleteSuccessAction);
        expect(secondAction).toEqual(expectedOperationCompleteAction);
      });

    });

  });

  describe('#suspendPolicy$', () => {

    it('should return a new suspendPolicySuccess and new operationComplete actions, on success', () => {
      const {policyService, runner, policyEffects} = setup();
      policyService.suspendPolicy.and.returnValue(Observable.of(this.operationSuccess));
      const expectedDeleteSuccessAction = policyActions.suspendPolicySuccess(this.policy1.id);
      const expectedOperationCompleteAction = operationActions.operationComplete(this.operationSuccess);
      runner.queue(policyActions.suspendPolicy(this.policy1));

      policyEffects.suspendPolicy$.pairwise().subscribe(([firstAction, secondAction]) => {
        expect(firstAction).toEqual(expectedDeleteSuccessAction);
        expect(secondAction).toEqual(expectedOperationCompleteAction);
      });

    });

  });

  describe('#resumePolicy$', () => {

    it('should return a new resumePolicySuccess and new operationComplete actions, on success', () => {
      const {policyService, runner, policyEffects} = setup();
      policyService.resumePolicy.and.returnValue(Observable.of(this.operationSuccess));
      const expectedDeleteSuccessAction = policyActions.resumePolicySuccess(this.policy1.id);
      const expectedOperationCompleteAction = operationActions.operationComplete(this.operationSuccess);
      runner.queue(policyActions.resumePolicy(this.policy1));

      policyEffects.resumePolicy$.pairwise().subscribe(([firstAction, secondAction]) => {
        expect(firstAction).toEqual(expectedDeleteSuccessAction);
        expect(secondAction).toEqual(expectedOperationCompleteAction);
      });

    });

  });

});
