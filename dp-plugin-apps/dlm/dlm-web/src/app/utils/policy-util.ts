/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Policy } from 'models/policy.model';
import { POLICY_UI_STATUS, POLICY_STATUS } from 'constants/status.constant';

export const isEnded = (policy: Policy) => policy.uiStatus === POLICY_UI_STATUS.ENDED;
export const activateDisabled = (policy: Policy) => policy.status === POLICY_STATUS.RUNNING || isEnded(policy);
export const suspendDisabled = (policy: Policy) => policy.status === POLICY_STATUS.SUSPENDED || isEnded(policy);
