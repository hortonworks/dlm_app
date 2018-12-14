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

export const SUBMITTED = 'SUBMITTED';
export const SUCCESS = 'SUCCESS';
export const FAILED = 'FAILED';
export const WARNING = 'WARNING';
export const WARNINGS = 'WARNINGS';
export const RUNNING = 'RUNNING';
export const SUSPENDED = 'SUSPENDED';
export const SKIPPED = 'SKIPPED';
export const INIT = 'INIT';
export const IN_PROGRESS = 'IN_PROGRESS';
export const KILLED = 'KILLED';
export const SUSPENDEDFORINTERVENTION = 'SUSPENDEDFORINTERVENTION';

export const JOB_STATUS = {
  RUNNING: RUNNING,
  SUCCESS: SUCCESS,
  WARNINGS: WARNINGS,
  FAILED: FAILED,
  SKIPPED: SKIPPED,
  KILLED: KILLED
};

export const POLICY_STATUS = {
  SUBMITTED: SUBMITTED,
  FAILED: FAILED,
  WARNING: WARNING,
  RUNNING: RUNNING,
  SUSPENDED: SUSPENDED,
  SUSPENDEDFORINTERVENTION
};

export const EVENT_SEVERITY = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical'
};

export const CLUSTER_STATUS = {
  HEALTHY: 'HEALTHY',
  UNHEALTHY: 'UNHEALTHY',
  WARNING: 'WARNING',
  UNKNOWN: 'UNKNOWN'
};

export const SERVICE_STATUS = {
  STARTED: 'STARTED',
  INSTALLED: 'INSTALLED',
  UNKNOWN: 'UNKNOWN'
};

export const PROGRESS_STATUS = {
  INIT: INIT,
  IN_PROGRESS: IN_PROGRESS,
  SUCCESS: SUCCESS,
  FAILED: FAILED
};

// a map of statuses converted from API response
export const POLICY_UI_STATUS = {
  ACTIVE: 'ACTIVE', // RUNNING
  SUSPENDED: 'SUSPENDED', // SUSPENDED
  ENDED: 'ENDED' // others e.g. SUCCEEDED, FAILED, SUCCEEDEDWITHSKIPPED, FAILEDWITHSKIPPED
};

// a map of POLICY_STATUS_UI translations used as value PolicyModel.displayStatus
export const POLICY_DISPLAY_STATUS = {
  [POLICY_UI_STATUS.ACTIVE]: 'common.status.active',
  [POLICY_UI_STATUS.SUSPENDED]: 'common.status.suspended',
  [POLICY_UI_STATUS.ENDED]: 'common.status.ended'
};
