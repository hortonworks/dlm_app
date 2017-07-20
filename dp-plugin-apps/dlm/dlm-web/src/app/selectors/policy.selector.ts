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

export const getEntities = createSelector(getPolicies, state => state.entities);

export const getAllPolicies = createSelector(getEntities, mapToList);

export const getAllPoliciesWithClusters = createSelector(getAllPolicies, getAllClusters, (policies, clusters) => {
  return policies.map(policy => {
    return {
      ...policy,
      targetClusterResource: clusters.find(cluster => cluster.name === policy.targetCluster) || {},
      sourceClusterResource: clusters.find(cluster => cluster.name === policy.sourceCluster) || {}
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
    return {
      ...policy,
      jobsResource,
      lastJobResource,
      lastGoodJobResource
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
