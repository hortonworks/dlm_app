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

import { createSelector } from 'reselect';

import { Cluster } from 'models/cluster.model';
import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';
import { ClustersStatus, PoliciesStatus, JobsStatus } from 'models/aggregations.model';
import { getAllClusters, getClustersWithLowCapacity } from './cluster.selector';
import { getNonCompletedPolicies, getAllPolicies, getUnhealthyPolicies } from './policy.selector';
import { CLUSTER_STATUS, POLICY_STATUS, JOB_STATUS } from 'constants/status.constant';
import { contains } from 'utils/array-util';

const countJobsByStatus = (jobs: Job[] = [], status: string): number => jobs.filter(job => job.status === status).length;

export const getClustersHealth = createSelector(
  getAllClusters, getClustersWithLowCapacity,
  (clusters: Cluster[], lowCapacityClusters: Cluster[]): ClustersStatus => {
  let healthy = 0;
  let unhealthy = 0;
  let unknown = 0;
  const warning = lowCapacityClusters.length;

  clusters.forEach(cluster => {
    if (cluster.healthStatus === CLUSTER_STATUS.HEALTHY) {
      healthy++;
    }
    if (cluster.healthStatus === CLUSTER_STATUS.UNHEALTHY) {
      unhealthy++;
    }
    if (cluster.healthStatus === CLUSTER_STATUS.UNKNOWN) {
      unknown++;
    }
  });

  return {
    healthy,
    unhealthy,
    warning,
    unknown,
    total: healthy + unhealthy + unknown
  };
});

export const getPoliciesHealth = createSelector(getAllPolicies, getUnhealthyPolicies,
  (policies: Policy[], unhealthyPolicies: Policy[]): PoliciesStatus  => {
    let active = 0;
    let suspended = 0;
    policies.forEach(policy => {
      if (contains([POLICY_STATUS.SUSPENDED, POLICY_STATUS.SUSPENDEDFORINTERVENTION], policy.status)) {
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
