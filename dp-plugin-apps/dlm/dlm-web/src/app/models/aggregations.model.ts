export interface ClustersStatus {
  healthy: number;
  unhealthy: number;
  warning: number;
  total: number;
};

export interface PoliciesStatus {
  active: number;
  suspended: number;
  unhealthy: number;
  total: number;
};

export interface JobsStatus {
  inProgress: number;
  lastFailed: number;
  last10Failed: number;
  total: number;
};
