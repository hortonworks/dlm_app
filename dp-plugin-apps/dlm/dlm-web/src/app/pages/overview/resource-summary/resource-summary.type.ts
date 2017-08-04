/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export interface SummaryData {
  label: string;
  value: string|number;
  actionable?: boolean;
  iconClass: string;
};

export interface ResourceInfo {
  title: string;
  data: SummaryData[];
};

export const SUMMARY_PANELS = {
  CLUSTER: 'CLUSTER',
  POLICIES: 'POLICIES',
  JOBS: 'JOBS'
};

export const CLUSTERS_HEALTH_STATE = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  UNHEALTHY: 'UNHEALTHY'
};

export const POLICIES_HEALTH_STATE = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  UNHEALTHY: 'UNHEALTHY'
};

export const JOBS_HEALTH_STATE = {
  IN_PROGRESS: 'IN_PROGRESS',
  LAST_FAILED: 'LAST_FAILED',
  LAST_10_FAILED: 'LAST_10_FAILED'
};
