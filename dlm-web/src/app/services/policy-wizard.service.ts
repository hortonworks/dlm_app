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

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { Observable } from 'rxjs/Observable';
import { getStep } from 'selectors/create-policy.selector';
import { StepState, Step } from 'models/wizard.model';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class PolicyWizardService {

  constructor(private store: Store<State>) { }

  /**
   * Emits value when specified step become active
   *
   * @param stepId {string} wizard step id
   */
  activeStep$(stepId: string): Observable<any> {
    return this.store.select(getStep(stepId))
      .distinctUntilKeyChanged('state')
      .filter(step => step.state === 'active');
  }

  publishValidationStatus(publisher: StepComponent, form: FormGroup): Subscription {
    return form.statusChanges.map(_ => publisher.isFormValid()).distinctUntilChanged()
      .subscribe(isFormValid => publisher.onFormValidityChange.emit(isFormValid));
  }
}
