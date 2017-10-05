/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';

import { Cluster } from 'models/cluster.model';
import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';
import { ClustersStatus, PoliciesStatus, JobsStatus } from 'models/aggregations.model';
import { getAllClusters, getClustersWithLowCapacity } from './cluster.selector';
import { getNonCompletedPolicies, getAllPolicies, getUnhealthyPolicies } from './policy.selector';
import { getAllJobs } from './job.selector';
import { CLUSTER_STATUS, POLICY_STATUS, JOB_STATUS } from 'constants/status.constant';

const countJobsByStatus = (jobs: Job[] = [], status: string): number => jobs.filter(job => job.status === status).length;

export const getClustersHealth = createSelector(
  getAllClusters, getClustersWithLowCapacity,
  (clusters: Cluster[], lowCapacityClusters: Cluster[]): ClustersStatus => {
  let healthy = 0;
  let unhealthy = 0;
  const warning = lowCapacityClusters.length;

  clusters.forEach(cluster => {
    if (cluster.healthStatus === CLUSTER_STATUS.HEALTHY) {
      healthy++;
    }
    if (cluster.healthStatus === CLUSTER_STATUS.UNHEALTHY) {
      unhealthy++;
    }
  });

  return {
    healthy,
    unhealthy,
    warning,
    total: healthy + unhealthy
  };
});

export const getPoliciesHealth = createSelector(getAllPolicies, getUnhealthyPolicies,
  (policies: Policy[], unhealthyPolicies: Policy[]): PoliciesStatus  => {
    let active = 0;
    let suspended = 0;
    policies.forEach(policy => {
      if (policy.status === POLICY_STATUS.SUSPENDED) {
        suspended++;
      } else if (policy.status === POLICY_STATUS.RUNNING) {
        active++;
      }
    });

    return {
      active,
      suspended,
      unhealthy: unhealthyPolicies.length,
      total: policies.length
    };
  });

export const getJobsHealth = createSelector(getNonCompletedPolicies, (policies: Policy[]): JobsStatus => {
    let inProgress = 0;
    let lastFailed = 0;
    let last10Failed = 0;

    policies.forEach(policy => {
      const lastJobs = (policy.jobsResource || []).slice(0, 10);
      if (lastJobs[0].status === JOB_STATUS.FAILED) {
        lastFailed++;
      }
      inProgress += countJobsByStatus(lastJobs, JOB_STATUS.RUNNING);
      last10Failed += countJobsByStatus(lastJobs, JOB_STATUS.FAILED);
    });

    return {
      inProgress,
      lastFailed,
      last10Failed,
      total: inProgress + lastFailed + last10Failed
    };
  });
