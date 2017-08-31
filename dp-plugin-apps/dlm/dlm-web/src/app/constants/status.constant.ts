/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export const SUBMITTED = 'SUBMITTED';
export const SUCCESS = 'SUCCESS';
export const FAILED = 'FAILED';
export const WARNING = 'WARNING';
export const WARNINGS = 'WARNINGS';
export const RUNNING = 'RUNNING';
export const SUSPENDED = 'SUSPENDED';
export const IGNORED = 'IGNORED';
export const INIT = 'INIT';
export const IN_PROGRESS = 'IN_PROGRESS';

export const JOB_STATUS = {
  RUNNING: RUNNING,
  SUCCESS: SUCCESS,
  WARNINGS: WARNINGS,
  FAILED: FAILED,
  IGNORED: IGNORED
};

export const POLICY_STATUS = {
  SUBMITTED: SUBMITTED,
  FAILED: FAILED,
  WARNING: WARNING,
  RUNNING: RUNNING,
  SUSPENDED: SUSPENDED
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
  WARNING: 'WARNING'
};

export const SERVICE_STATUS = {
  STARTED: 'STARTED',
  INSTALLED: 'INSTALLED'
};

export const PROGRESS_STATUS = {
  INIT: INIT,
  IN_PROGRESS: IN_PROGRESS,
  SUCCESS: SUCCESS,
  FAILED: FAILED
};

export const POLICY_DISPLAY_STATUS = {
  [POLICY_STATUS.RUNNING]: 'common.status.active',
  [POLICY_STATUS.SUSPENDED]: 'common.status.suspended'
};
