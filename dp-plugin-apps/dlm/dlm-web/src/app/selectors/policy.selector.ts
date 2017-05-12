import { createSelector } from 'reselect';
import { getPolicies } from './root.selector';
import { mapToList } from 'utils/store-util';
import { getAllClusters } from './cluster.selector';
import { getAllJobs } from './job.selector';

export const getEntities = createSelector(getPolicies, state => state.entities);
export const getAllPolicies = createSelector(getEntities, mapToList);

export const getPolicyClusterJob = createSelector(getAllPolicies, getAllClusters, getAllJobs, (policies, clusters, jobs) => {
  return policies.map(policy => {
    return {
      ...policy,
      jobsResource: jobs.filter(job => job.name === policy.id) || [],
      targetClusterResource: clusters.find(cluster => cluster.name === policy.targetCluster) || {},
      destinationClusterResource: clusters.find(cluster => cluster.name === policy.sourceCluster) || {}
    };
  });
});
