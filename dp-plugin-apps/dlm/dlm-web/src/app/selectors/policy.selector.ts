import { createSelector } from 'reselect';
import { getPolicies } from './root.selector';
import { State } from '../reducers/policy.reducer';
import { mapToList } from '../utils/store-util';
import { getAllClusters } from './cluster.selector';
import { getAllJobs } from './job.selector';

export const getEntities = createSelector(getPolicies, (state) => state.entities);
export const getAllPolicies = createSelector(getEntities, mapToList);

export const getPolicyClusterJob = createSelector(
  [getAllPolicies, getAllClusters, getAllJobs],
  (policies, clusters, jobs) => {
    return policies.map(policy => {
      const jobsResource = jobs.filter(job => job.policy === policy.id) || [];
      const targetClusterResource = clusters.find(cluster => cluster.id === policy.targetclusters[0]) || {};
      const destinationClusterResource = clusters.find(cluster => cluster.id === policy.sourceclusters[0]) || {};
      return {
        ...policy,
        jobsResource,
        targetClusterResource,
        destinationClusterResource
      };
    });
  }
);
