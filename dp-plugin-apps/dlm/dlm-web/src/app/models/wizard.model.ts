/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  StepGeneralValue, StepSourceValue, StepDestinationValue,
  StepScheduleValue, StepAdvancedValue
} from 'models/create-policy-form.model';

export interface Step<T = any> {
  label: string;
  id: string;
  index: number;
  state: 'active' | 'disabled' | 'completed';
  value: T;
  nextStepId: string;
  previousStepId: string;
}

export interface CreatePolicyFormState {
  general: Step<StepGeneralValue>;
  source: Step<StepSourceValue>;
  destination: Step<StepDestinationValue>;
  schedule: Step<StepScheduleValue>;
  advanced: Step<StepAdvancedValue>;
}
