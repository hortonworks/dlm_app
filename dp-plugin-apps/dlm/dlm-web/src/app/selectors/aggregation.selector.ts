import { createSelector } from 'reselect';

import { Cluster } from 'models/cluster.model';
import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';
import { ClustersStatus, PoliciesStatus, JobsStatus } from 'models/aggregations.model';
import { getAllClusters, getClustersWithLowCapacity } from './cluster.selector';
import { getNonCompletedPolicies, getAllPolicies } from './policy.selector';
import { getAllJobs } from './job.selector';
import { CLUSTER_STATUS, POLICY_STATUS, JOB_STATUS } from 'constants/status.constant';

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
    total: healthy + unhealthy + warning
  };
});

export const getPoliciesHealth = createSelector(getAllPolicies, getAllClusters,
  (policies: Policy[], clusters: Cluster[]): PoliciesStatus  => {
    let active = 0;
    let suspended = 0;
    let unhealthy = 0;
    const unhealthyClusters = clusters.reduce((unhealthyList, cluster) => {
      if (cluster.healthStatus === CLUSTER_STATUS.UNHEALTHY) {
        return unhealthyList.concat(cluster.name);
      }
      return unhealthyList;
    }, []);

    policies.forEach(policy => {
      if (unhealthyClusters.indexOf(policy.sourceCluster) > 0 || unhealthyClusters.indexOf(policy.targetCluster) > 0) {
        unhealthy++;
      } else if (policy.status === POLICY_STATUS.SUSPENDED) {
        suspended++;
      } else if (policy.status === POLICY_STATUS.RUNNING) {
        active++;
      }
    });

    return {
      active,
      suspended,
      unhealthy,
      total: active + suspended + unhealthy
    };
  });

export const getJobsHealth = createSelector(getNonCompletedPolicies, getAllJobs,
  (policies: Policy[], jobs: Job[]): JobsStatus => {
    let inProgress = 0;
    let lastFailed = 0;
    let last10Failed = 0;

    policies.forEach(policy => {
      const lastJobs = (policy.jobsResource || []).slice(0, 10);
      if (lastJobs[0].status === JOB_STATUS.FAILED) {
        lastFailed++;
      }
      if (lastJobs[0].status === JOB_STATUS.RUNNING) {
        inProgress++;
      }
      last10Failed += lastJobs.filter(job => job.status === JOB_STATUS.FAILED).length;
    });

    return {
      inProgress,
      lastFailed,
      last10Failed,
      total: inProgress + lastFailed + last10Failed
    };
  });