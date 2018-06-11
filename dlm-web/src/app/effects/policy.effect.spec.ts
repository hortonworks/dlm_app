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

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import { provideMockActions } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import { PolicyEffects } from './policy.effect';
import { JobService } from 'services/job.service';
import { PolicyService } from 'services/policy.service';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import * as policyActions from 'actions/policy.action';
import * as operationActions from 'actions/operation.action';
import { Policy } from 'models/policy.model';
import { OperationResponse } from 'models/operation-response.model';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'services/notification.service';

describe('PolicyEffects', () => {
  let actions: ReplaySubject<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
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
        },
        provideMockActions(() => actions)
      ]
    });
  });

  function setup() {
    return {
      policyService: TestBed.get(PolicyService),
      policyEffects: TestBed.get(PolicyEffects)
    };
  }

  beforeEach(() => {
    this.policy1 = <Policy>{id: '1'};
    this.operationSuccess = <OperationResponse>{id: '1'};
    actions = new ReplaySubject(1);
  });

  describe('#deletePolicy$', () => {

    it('should return a new deletePolicySuccess and new operationComplete actions, on success', () => {
      const {policyService, policyEffects} = setup();
      policyService.deletePolicy.and.returnValue(Observable.of(this.operationSuccess));
      const expectedDeleteSuccessAction = policyActions.deletePolicySuccess(this.policy1.id, {});
      actions.next(policyActions.deletePolicy(this.policy1));

      policyEffects.deletePolicy$.subscribe(action => {
        expect(action).toEqual(expectedDeleteSuccessAction);
      });

    });

  });

  describe('#suspendPolicy$', () => {

    it('should return a new suspendPolicySuccess and new operationComplete actions, on success', () => {
      const {policyService, policyEffects} = setup();
      policyService.suspendPolicy.and.returnValue(Observable.of(this.operationSuccess));
      const expectedDeleteSuccessAction = policyActions.suspendPolicySuccess(this.policy1.id, {});
      actions.next(policyActions.suspendPolicy(this.policy1));

      policyEffects.suspendPolicy$.subscribe(action => {
        expect(action).toEqual(expectedDeleteSuccessAction);
      });

    });

  });

  describe('#resumePolicy$', () => {

    it('should return a new resumePolicySuccess and new operationComplete actions, on success', () => {
      const {policyService, policyEffects} = setup();
      policyService.resumePolicy.and.returnValue(Observable.of(this.operationSuccess));
      const expectedDeleteSuccessAction = policyActions.resumePolicySuccess(this.policy1.id, {});
      actions.next(policyActions.resumePolicy(this.policy1, {}));

      policyEffects.resumePolicy$.subscribe(action => {
        expect(action).toEqual(expectedDeleteSuccessAction);
      });

    });

  });

});
