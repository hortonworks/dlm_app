/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { createSelector } from 'reselect';
import { getPolicies } from './root.selector';
import { mapToList } from 'utils/store-util';
import { PoliciesCount } from 'models/policies-count.model';
import { Cluster } from 'models/cluster.model';
import { Policy } from 'models/policy.model';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { getAllClusters } from './cluster.selector';
import { getAllJobs } from './job.selector';
import { sortByDateField, contains } from 'utils/array-util';
import { JOB_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { PolicyService } from 'services/policy.service';
import { getAllBeaconAdminStatuses } from 'selectors/beacon.selector';
import { POLICY_MODES, POLICY_EXECUTION_TYPES } from 'constants/policy.constant';
import { SERVICES } from 'constants/cluster.constant';

const hasStoppedServices = (cluster: Cluster, services: string[]): boolean => {
  return cluster && cluster.status && cluster.status.some(s => contains(services, s.service_name) && s.state !== SERVICE_STATUS.STARTED);
};

const checkClusterServices = (policy: Policy, services: string[]): boolean => {
  return hasStoppedServices(policy.targetClusterResource, services) ||
    hasStoppedServices(policy.sourceClusterResource, services);
};

export const getEntities = createSelector(getPolicies, state => state.entities);

export const getAllPolicies = createSelector(getEntities, mapToList);

export const getAllPoliciesWithClusters = createSelector(getAllPolicies, getAllClusters, (policies, clusters) => {
  return policies.map(policy => {
    return {
      ...policy,
      targetClusterResource: clusters.find(cluster =>  PolicyService
        .makeClusterId(cluster.dataCenter, cluster.name) === policy.targetCluster) || {},
      sourceClusterResource: clusters.find(cluster =>  PolicyService
        .makeClusterId(cluster.dataCenter, cluster.name) === policy.sourceCluster) || {}
    };
  });
});

export const getPolicyClusterJob = createSelector(getAllPoliciesWithClusters, getAllJobs, (policies, jobs) => {
  return policies.map(policy => {
    let policyJobs = jobs.filter(job => job.policyId === policy.id);
    policyJobs = policyJobs.length ? policyJobs : policy.jobs || [];
    // Filter out ignored jobs
    policyJobs = policyJobs.length ? policyJobs.filter(job => job.status !== JOB_STATUS.IGNORED) : [];
    const jobsResource = policyJobs.length ? sortByDateField(policyJobs, 'startTime') : [];
    const lastJobResource = jobsResource.length ? jobsResource[0] : null;
    const lastGoodJobResource = jobsResource.length ? jobsResource.find(j => j.status === JOB_STATUS.SUCCESS) : null;
    const lastTenJobs = jobsResource.length ? policyJobs.slice(0, 10) : [];
    let lastJobDuration;
    if (!jobsResource.length) {
      lastJobDuration = null;
    } else {
      if (jobsResource.length === 1) {
        lastJobDuration = jobsResource[0].duration;
      } else {
        const lastCompletedJob = jobsResource.find(j => j.isCompleted);
        lastJobDuration = lastCompletedJob ? lastCompletedJob.duration : null;
      }
    }
    return {
      ...policy,
      jobsResource,
      lastJobResource,
      lastGoodJobResource,
      lastJobDuration,
      lastTenJobs
    };
  });
});

export const getPolicyClusterJobFailedLastTen = createSelector(getPolicyClusterJob, policies =>
  policies.filter(p =>
    p.lastTenJobs.some(j =>
    j.status !== JOB_STATUS.SUCCESS)));

export const getCountPoliciesForSourceClusters = createSelector(getAllPoliciesWithClusters, getAllClusters, (policies, clusters) => {
  return clusters.reduce((entities: { [id: number]: PoliciesCount }, entity: Cluster) => {
    return Object.assign({}, entities, {
      [entity.id]: {
        clusterId: entity.id,
        clusterName: entity.name,
        policies: policies.filter(policy => policy.sourceClusterResource.id === entity.id).length
      }
    });
  }, {});
});


export const getNonCompletedPolicies = createSelector(getPolicyClusterJob, (policies: Policy[]): Policy[] => {
  return policies.filter(policy => policy.jobsResource.some(job => job.status !== JOB_STATUS.SUCCESS));
});

export const getUnhealthyPolicies = createSelector(
  getAllPoliciesWithClusters,
  (policies: Policy[]) => {
    const unhealthy = policies
    .filter(policy => {
      const requiredServices = [SERVICES.BEACON, SERVICES.HDFS];
      const yarnStopped = hasStoppedServices(policy.targetClusterResource, [SERVICES.YARN]);
      const requiredServicesStopped = checkClusterServices(policy, requiredServices);
      const hiveStopped = policy.executionType === POLICY_EXECUTION_TYPES.HIVE && checkClusterServices(policy, [SERVICES.HIVE]);
      return requiredServicesStopped || yarnStopped || hiveStopped;
    });
    return unhealthy;
  }
);

export const getPoliciesTableData = createSelector(getPolicyClusterJob, getAllBeaconAdminStatuses,
  (policies: Policy[], beaconStatuses: BeaconAdminStatus[]) => {
    return policies.map(policy => {
      const clusterStatus = beaconStatuses.find(c => c.clusterId === policy.targetClusterResource.id);
      if (!clusterStatus) {
        return {...policy, rangerEnabled: false, accessMode: POLICY_MODES.READ_WRITE};
      }
      const {plugins, rangerCreateDenyPolicy} = clusterStatus.beaconAdminStatus;
      const rangerEnabled = contains(plugins, SERVICES.RANGER);
      return {
        ...policy,
        accessMode: rangerEnabled && rangerCreateDenyPolicy === 'true' ? POLICY_MODES.READ_ONLY : POLICY_MODES.READ_WRITE,
        rangerEnabled
      };
    });
  });
