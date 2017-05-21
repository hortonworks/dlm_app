import { createSelector } from 'reselect';
import { getPolicies } from './root.selector';
import { mapToList } from 'utils/store-util';
import { getAllClusters } from './cluster.selector';
import { getAllJobs } from './job.selector';

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
    return {
      ...policy,
      jobsResource: jobs.filter(job => job.name === policy.id) || []
    };
  });
});
