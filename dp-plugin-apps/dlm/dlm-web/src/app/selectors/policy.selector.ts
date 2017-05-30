import { createSelector } from 'reselect';
import { getPolicies } from './root.selector';
import { mapToList } from 'utils/store-util';
import { PoliciesCount } from 'models/policies-count.model';
import { Cluster } from 'models/cluster.model';
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
    const jobsResource = jobs.filter(job => job.name === policy.id) || [];
    const lastJobResource = jobsResource.length ? jobsResource.sort((a, b) => a.startTime > b.startTime ? -1 : 1)[0] : null;
    return {
      ...policy,
      jobsResource,
      lastJobResource
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
