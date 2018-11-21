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
import { getPolicies } from './root.selector';
import { createEntitySelector, belongsTo, KeyTarget, belongsToThrough } from 'utils/store-util';
import { PoliciesCount } from 'models/policies-count.model';
import { Cluster } from 'models/cluster.model';
import { Policy } from 'models/policy.model';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { getAllClusters, getClustersWithBeacon } from './cluster.selector';
import { getAllBeaconCloudCreds } from './beacon-cloud-cred.selector';
import { getAllJobs } from './job.selector';
import { sortByDateField, contains, uniqBy } from 'utils/array-util';
import { JOB_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { PolicyService } from 'services/policy.service';
import { getAllBeaconAdminStatuses } from 'selectors/beacon.selector';
import { POLICY_MODES, POLICY_EXECUTION_TYPES, SOURCE_TYPES } from 'constants/policy.constant';
import { SERVICES } from 'constants/cluster.constant';
import { CloudCredential } from 'models/beacon-cloud-cred.model';

const hasStoppedServices = (cluster: Cluster, services: string[]): boolean => {
  return cluster && cluster.status && cluster.status.some(s => contains(services, s.service_name) && s.state !== SERVICE_STATUS.STARTED);
};

const checkClusterServices = (policy: Policy, services: string[]): boolean => {
  return hasStoppedServices(policy.targetClusterResource, services) ||
    hasStoppedServices(policy.sourceClusterResource, services);
};

const findTargetCluster = (clusters: Cluster[], policy: Policy) =>
  clusters.find(c => policy.targetCluster === PolicyService.makeClusterId(c.dataCenter, c.name));
const findSourceCluster = (clusters: Cluster[], policy: Policy) =>
  clusters.find(c => policy.sourceCluster === PolicyService.makeClusterId(c.dataCenter, c.name));

export const policySelector = createEntitySelector<Policy>('Policy', getPolicies, {
  beaconCloudCred: belongsTo('BeaconCloudCred', {
    id: 'customProperties.cloudCred',
    target: KeyTarget.Self
  }),
  cloudAccount: belongsToThrough('BeaconCloudCred', 'cloudAccount', {
    id: 'customProperties.cloudCred',
    target: KeyTarget.Self
  }),
  targetClusterResource: belongsTo('Cluster', (policy: Policy, clusters: Cluster[]) => ({
    entities: findTargetCluster(clusters, policy)
  })),
  sourceClusterResource: belongsTo('Cluster', (policy: Policy, clusters: Cluster[]) => ({
    entities: findSourceCluster(clusters, policy)
  })),
  clusterResourceForRequests: belongsTo('Cluster', (policy: Policy, clusters: Cluster[]) => {
    let entities = policy.targetCluster ? findTargetCluster(clusters, policy) : findSourceCluster(clusters, policy);
    const customProperties = policy.customProperties || {};
    if (policy.executionType === POLICY_EXECUTION_TYPES.HIVE && 'cloudCred' in customProperties) {
      entities = findSourceCluster(clusters, policy);
    }
    return {
      entities
    };
  })
});

export const getEntities = policySelector.getEntities;
export const getAllPolicies = policySelector.getAllEntities;
export const getPolicyById = policySelector.getEntityById;

export const getAllPoliciesWithClusters = createSelector(getAllPolicies, getClustersWithBeacon, (policies, clusters) => {
  return policies.map(policy => {
    const p = {
      ...policy,
      targetClusterResource: clusters.find(cluster =>  PolicyService
        .makeClusterId(cluster.dataCenter, cluster.name) === policy.targetCluster) || {} as Cluster,
      sourceClusterResource: clusters.find(cluster =>  PolicyService
        .makeClusterId(cluster.dataCenter, cluster.name) === policy.sourceCluster) || {} as Cluster
    };
    p.clusterResourceForRequests = p.targetClusterResource.id ? p.targetClusterResource : p.sourceClusterResource;
    const customProperties = p.customProperties || {};
    if (p.executionType === POLICY_EXECUTION_TYPES.HIVE && 'cloudCred' in customProperties) {
      p.clusterResourceForRequests = p.sourceClusterResource;
    }
    return p;
  });
});

export const getAllPoliciesWithCloud = createSelector(getAllPoliciesWithClusters, getAllBeaconCloudCreds, (policies, credentials) => {
  // Since cloud credential id could be different for the same cloud credential registered
  // with different beacon clusters, we need to check the cloud credential id with either the source or target
  // cluster to which each policy and the given cloud credential id are associated with
  const cloudCredential = (clusterId, credentialId) => credentials.find( cred => {
    if ('clusters' in cred && cred.clusters.length) {
      const cluster = cred.clusters.find(clust => clust.clusterId === clusterId);
      return cluster && cluster.cloudCredId === credentialId;
    }
  });
  return policies.map(policy => {
    const cloudCred = 'customProperties' in policy && 'cloudCred' in policy.customProperties ? policy.customProperties.cloudCred : '';
    const p = {
      ...policy,
      cloudCredentialResource: policy.hasOwnProperty('sourceCluster') ?
        cloudCredential(policy.sourceClusterResource.id, cloudCred) || {} as CloudCredential :
        cloudCredential(policy.targetClusterResource.id, cloudCred) || {} as CloudCredential,
      sourceType: 'sourceCluster' in policy ? SOURCE_TYPES.CLUSTER : SOURCE_TYPES.S3,
      targetType: 'targetCluster' in policy ? SOURCE_TYPES.CLUSTER : SOURCE_TYPES.S3
    };
    p.clusterResourceForRequests = p.targetClusterResource.id ? p.targetClusterResource : p.sourceClusterResource;
    const customProperties = p.customProperties || {};
    if (p.executionType === POLICY_EXECUTION_TYPES.HIVE && 'cloudCred' in customProperties) {
      p.clusterResourceForRequests = p.sourceClusterResource;
    }
    return p;
  });
});

export const getPolicyClusterJob = createSelector(getAllPoliciesWithCloud, getAllJobs, (policies, jobs) => {
  return policies.map((policy: Policy): Policy => {
    const policyJobs = uniqBy((policy.jobs || []).concat(jobs.filter(job => job.policyId === policy.id)), 'id');
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
      jobs: policy && policy.jobs && policy.jobs.length ? policy.jobs : policyJobs,
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
      const clusterStatus = beaconStatuses.find(c => c.clusterId === policy.clusterResourceForRequests.id);
      // If destination is cloud, mark access as READ_WRITE
      if (!clusterStatus || (policy.cloudCredentialResource && !policy.targetCluster)) {
        return {...policy, rangerEnabled: false, accessMode: POLICY_MODES.READ_WRITE};
      }
      const {plugins} = clusterStatus;
      const {rangerCreateDenyPolicy} = clusterStatus.beaconAdminStatus;
      const rangerEnabled = contains(plugins, SERVICES.RANGER);
      return {
        ...policy,
        accessMode: rangerEnabled && rangerCreateDenyPolicy === 'true' ? POLICY_MODES.READ_ONLY : POLICY_MODES.READ_WRITE,
        rangerEnabled
      };
    });
  });
