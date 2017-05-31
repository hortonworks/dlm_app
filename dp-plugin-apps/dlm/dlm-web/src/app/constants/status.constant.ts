export const IN_PROGRESS = 'IN_PROGRESS';
export const SUBMITTED = 'SUBMITTED';
export const SUCCESS = 'SUCCESS';
export const FAILED = 'FAILED';
export const WARNING = 'WARNING';
export const WARNINGS = 'WARNINGS';
export const RUNNING = 'RUNNING';
export const SUSPENDED = 'SUSPENDED';

export const JOB_STATUS = {
  [IN_PROGRESS]: IN_PROGRESS,
  [SUCCESS]: SUCCESS,
  [WARNINGS]: WARNINGS,
  [FAILED]: FAILED
};

export const POLICY_STATUS = {
  [SUBMITTED]: SUBMITTED,
  [FAILED]: FAILED,
  [WARNING]: WARNING,
  [RUNNING]: RUNNING,
  [SUSPENDED]: SUSPENDED
};

export const EVENT_SEVERITY = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical'
};
