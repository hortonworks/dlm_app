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
import { getAllClusters } from './cluster.selector';
import { getAllJobs } from './job.selector';
import { sortByDateField } from 'utils/array-util';
import { JOB_STATUS, CLUSTER_STATUS } from 'constants/status.constant';
import { PolicyService } from 'services/policy.service';

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
    const jobsResource = sortByDateField(policyJobs, 'startTime');
    const lastJobResource = jobsResource.length ? jobsResource[0] : null;
    const lastGoodJobResource = jobsResource.length ? jobsResource.find(j => j.status === 'SUCCESS') : null;
    const lastTenJobs = jobsResource.length ? policyJobs.slice(0, 10) : [];
    return {
      ...policy,
      jobsResource,
      lastJobResource,
      lastGoodJobResource,
      lastTenJobs
    };
  });
});

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
  (policies: Policy[]) => policies
    .filter(policy => [
        policy.targetClusterResource.healthStatus,
        policy.sourceClusterResource.healthStatus
      ].indexOf(CLUSTER_STATUS.UNHEALTHY) > -1
    )
);
