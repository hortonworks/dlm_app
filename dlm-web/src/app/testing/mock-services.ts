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

import { Store } from '@ngrx/store';
import { of, BehaviorSubject } from 'rxjs';
import { FeatureService } from 'services/feature.service';
import { AsyncActionsService } from 'services/async-actions.service';
import { DlmPropertiesService } from 'services/dlm-properties.service';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { TimepickerActions } from 'ngx-bootstrap/timepicker';

export const storeStub: jasmine.SpyObj<Store<{}>> = jasmine.createSpyObj('Store', ['select', 'dispatch']);
storeStub.select.and.returnValue(of());

export const featureStub: jasmine.SpyObj<FeatureService> = jasmine.createSpyObj('FeatureService', ['isDisabled', 'isEnabled']);

export const asyncActionsStub: jasmine.SpyObj<AsyncActionsService> = jasmine.createSpyObj('AsyncActionsService', ['dispatch']);
asyncActionsStub.dispatch.and.returnValue(of());

export const dlmPropertiesStub: jasmine.SpyObj<DlmPropertiesService> = jasmine.createSpyObj('DlmPropertiesService',
['getPoliciesQueryCount$']);
dlmPropertiesStub.getPoliciesQueryCount$.and.returnValue(of());

export const policyWizardStub: jasmine.SpyObj<PolicyWizardService> = jasmine.createSpyObj('PolicyWizardService',
['whenEditMode', 'publishValidationStatus', 'defaultEndTime', 'defaultStartTime']);
policyWizardStub.whenEditMode.and.returnValue(of());

export const timepickerActionsStub: jasmine.SpyObj<TimepickerActions> = jasmine.createSpyObj('TimepickerActions',
['updateControls', 'writeValue']);

export const timeZoneStub = { userTimezoneIndex$: new BehaviorSubject('') };

export const timepickerConfigStub = {};

export const clusterStub = {};

export const cloudAccountStub = {};

export const notificationStub = {};

export const jobStub = {};

export const navbarStub = {};

export const logStub = {};

export const policyStub = {};

export const hdfsStub = {};

export const hiveStub = {};
