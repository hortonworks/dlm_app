/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as policySelectors from './policy.selector';
import { State } from 'reducers';
import { Policy } from 'models/policy.model';
import * as stateUtils from 'testing/state';
import { Cluster } from 'models/cluster.model';
import { Job } from 'models/job.model';
import { SOURCE_TYPES } from 'constants/policy.constant';

describe('Policy Selectors', () => {

  let state: State;
  beforeEach(() => {
    this.policy1 = <Policy>{id: 'p1', targetCluster: 'dc1$c1', sourceCluster: 'dc2$c2'};
    this.policy2 = <Policy>{id: 'p2', targetCluster: 'dc2$c2', sourceCluster: 'dc1$c1'};
    this.policy3 = <Policy>{id: 'p3', targetCluster: 'not-existing-cluster-1', sourceCluster: 'not-existing-cluster-2'};
    this.cluster1 = <Cluster>{id: 1, name: 'c1', dataCenter: 'dc1'};
    this.cluster2 = <Cluster>{id: 2, name: 'c2', dataCenter: 'dc2'};
    this.job1 = <Job>{id: '1', name: 'p1', startTime: '2016-06-12T03:32:00', policyId: 'p1', duration: 12};
    this.job2 = <Job>{id: '2', name: 'p2', startTime: '2017-06-12T03:32:00', policyId: 'p2', duration: 20};
    const policiesState = {
      policies: {
        entities: {
          [this.policy1.id]: this.policy1,
          [this.policy2.id]: this.policy2,
          [this.policy3.id]: this.policy3
        }
      }
    };
    const clustersState = {
      clusters: {
        entities: {
          [this.cluster1.id]: this.cluster1,
          [this.cluster2.id]: this.cluster2
        }
      }
    };
    const jobsState = {
      jobs: {
        entities: {
          [this.job1.id]: this.job1,
          [this.job2.id]: this.job2
        }
      }
    };
    const beaconCloudCredsState = {
      beaconCloudCreds: {
        entities: {
          'afc67ab0-f359-4fd0-a78a-96d6e6e7e8e5': {
            'id': 'afc67ab0-f359-4fd0-a78a-96d6e6e7e8e5',
            'name': 'Denys-HWX-Credential',
            'provider': 'AWS',
            'creationTime': '2018-03-14T10:58:13',
            'lastModifiedTime': '2018-03-14T23:51:13',
            'configs': {'version': '1'}
          }
        }
      }
    };

    state = stateUtils.getInitialState();
    state = stateUtils.changeState(state, policiesState);
    state = stateUtils.changeState(state, clustersState);
    state = stateUtils.changeState(state, jobsState);
    state = stateUtils.changeState(state, beaconCloudCredsState);
  });

  describe('#getEntities', () => {
    it('should return entities', () => {
      const result = policySelectors.getEntities(state);
      expect(result).toEqual(state.policies.entities);
    });
  });

  describe('#getAllPolicies', () => {
    it('should return array of entities', () => {
      const result = policySelectors.getAllPolicies(state);
      expect(result).toEqual([this.policy1, this.policy2, this.policy3]);
    });
  });

  describe('#getAllPoliciesWithClusters', () => {
    it('should add clusters to policy resource', () => {
      const result = policySelectors.getAllPoliciesWithClusters(state);
      const expectedResult = [
        {
          ...this.policy1,
          targetClusterResource: this.cluster1,
          clusterResourceForRequests: this.cluster1,
          sourceClusterResource: this.cluster2
        },
        {
          ...this.policy2,
          targetClusterResource: this.cluster2,
          clusterResourceForRequests: this.cluster2,
          sourceClusterResource: this.cluster1
        },
        {
          ...this.policy3,
          targetClusterResource: {},
          clusterResourceForRequests: {},
          sourceClusterResource: {}
        }
      ];
      expect(result).toEqual(expectedResult);
    });
  });

  describe('#getPolicyClusterJob', () => {
    it('should add jobs and clusters to policy resource', () => {
      const result = policySelectors.getPolicyClusterJob(state);
      const expectedResult = [
        {
          ...this.policy1,
          targetClusterResource: this.cluster1,
          clusterResourceForRequests: this.cluster1,
          sourceClusterResource: this.cluster2,
          jobsResource: [this.job1],
          lastJobResource: this.job1,
          lastJobDuration: 12,
          lastGoodJobResource: undefined,
          lastTenJobs: [this.job1],
          cloudCredentialResource: {},
          sourceType: SOURCE_TYPES.CLUSTER,
          targetType: SOURCE_TYPES.CLUSTER
        },
        {
          ...this.policy2,
          targetClusterResource: this.cluster2,
          clusterResourceForRequests: this.cluster2,
          sourceClusterResource: this.cluster1,
          jobsResource: [this.job2],
          lastJobResource: this.job2,
          lastJobDuration: 20,
          lastGoodJobResource: undefined,
          lastTenJobs: [this.job2],
          cloudCredentialResource: {},
          sourceType: SOURCE_TYPES.CLUSTER,
          targetType: SOURCE_TYPES.CLUSTER
        },
        {
          ...this.policy3,
          targetClusterResource: {},
          clusterResourceForRequests: {},
          sourceClusterResource: {},
          jobsResource: [],
          lastJobResource: null,
          lastJobDuration: null,
          lastGoodJobResource: null,
          lastTenJobs: [],
          cloudCredentialResource: {},
          sourceType: SOURCE_TYPES.CLUSTER,
          targetType: SOURCE_TYPES.CLUSTER
        }
      ];
      expect(result).toEqual(expectedResult);
    });
  });

});
