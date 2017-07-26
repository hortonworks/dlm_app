import * as policySelectors from './policy.selector';
import { State } from 'reducers';
import { Policy } from 'models/policy.model';
import * as stateUtils from 'testing/state';
import { Cluster } from 'models/cluster.model';
import { Job } from 'models/job.model';

describe('Policy Selectors', () => {

  let state: State;
  beforeEach(() => {
    this.policy1 = <Policy>{id: 'p1', targetCluster: 'c1', sourceCluster: 'c2'};
    this.policy2 = <Policy>{id: 'p2', targetCluster: 'c2', sourceCluster: 'c1'};
    this.policy3 = <Policy>{id: 'p3', targetCluster: 'not-existing-cluster-1', sourceCluster: 'not-existing-cluster-2'};
    this.cluster1 = <Cluster>{id: 1, name: 'c1'};
    this.cluster2 = <Cluster>{id: 2, name: 'c2'};
    this.job1 = <Job>{id: '1', name: 'p1', startTime: '2016-06-12T03:32:00', policyId: 'p1'};
    this.job2 = <Job>{id: '2', name: 'p2', startTime: '2017-06-12T03:32:00', policyId: 'p2'};
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
    state = stateUtils.getInitialState();
    state = stateUtils.changeState(state, policiesState);
    state = stateUtils.changeState(state, clustersState);
    state = stateUtils.changeState(state, jobsState);
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
          sourceClusterResource: this.cluster2
        },
        {
          ...this.policy2,
          targetClusterResource: this.cluster2,
          sourceClusterResource: this.cluster1
        },
        {
          ...this.policy3,
          targetClusterResource: {},
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
          sourceClusterResource: this.cluster2,
          jobsResource: [this.job1],
          lastJobResource: this.job1,
          lastGoodJobResource: undefined,
          lastTenJobs: [this.job1]
        },
        {
          ...this.policy2,
          targetClusterResource: this.cluster2,
          sourceClusterResource: this.cluster1,
          jobsResource: [this.job2],
          lastJobResource: this.job2,
          lastGoodJobResource: undefined,
          lastTenJobs: [this.job2]
        },
        {
          ...this.policy3,
          targetClusterResource: {},
          sourceClusterResource: {},
          jobsResource: [],
          lastJobResource: null,
          lastGoodJobResource: null,
          lastTenJobs: []
        }
      ];
      expect(result).toEqual(expectedResult);
    });
  });

});
