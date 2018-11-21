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

import { createEntitySelector, belongsTo, KeyTarget, hasMany, belongsToThrough } from './entity-selector';
import { mapToList } from './transform';

describe('Entity Selector', () => {
  describe('#createEntitySelector', () => {
    let state;
    beforeEach(() => {
      const policies = {
        policy1: {
          id: 'policy1',
          customProperties: {
            cloudCred: 'beaconCred1'
          }
        },
        policy2: {
          id: 'policy2',
          customProperties: {
            cloudCred: 'beaconCred2'
          }
        }
      };
      const jobs = {
        job1: {
          id: 'job1',
          policyId: 'policy1'
        },
        job2: {
          id: 'job2',
          policyId: 'policy1'
        },
        job3: {
          id: 'job3',
          policyId: 'policy2'
        }
      };
      const cloudAccounts = {
        cloudCredName1: {
          id: 'cloudCredName1',
          name: 'cloudCredName1'
        },
        cloudCredName2: {
          id: 'cloudCredName2',
          name: 'cloudCredName2'
        }
      };
      const beaconCloudCreds = {
        beaconCred1: {
          id: 'beaconCred1',
          name: 'cloudCredName1'
        },
        beaconCred2: {
          id: 'beaconCred2',
          name: 'cloudCredName2'
        }
      };
      state = {
        policies: { entities: {...policies} },
        jobs: { entities: {...jobs} },
        beaconCloudCreds: { entities: {...beaconCloudCreds}},
        cloudAccounts: { entities: {...cloudAccounts}}
      };
    });

    it('should create basic selectors', () => {
      const policies = createEntitySelector('Policy', (s) => s.policies);
      expect(policies.getEntities(state)).toEqual(state.policies.entities, 'entities map');
      expect(policies.getAllEntities(state)).toEqual(mapToList(state.policies.entities), 'entities list');
      expect(policies.getEntityById('policy1')(state)).toEqual(state.policies.entities.policy1, 'entity returned by id');
    });

    it('should return entities with related data using belongsTo relation', () => {
      createEntitySelector('BeaconCloudCred', (s) => s.beaconCloudCreds);

      const policies = createEntitySelector('Policy', (s) => s.policies, {
        beaconCloudCred: belongsTo('BeaconCloudCred', {
          id: 'customProperties.cloudCred',
          target: KeyTarget.Self
        })
      });

      expect(policies.getAllWithRelated(state)).toEqual([
        {
          id: 'policy1', customProperties: { cloudCred: 'beaconCred1'},
          beaconCloudCred: { id: 'beaconCred1', name: 'cloudCredName1' }
        },
        {
          id: 'policy2', customProperties: { cloudCred: 'beaconCred2'},
          beaconCloudCred: { id: 'beaconCred2', name: 'cloudCredName2' }
        }
      ]);
    });

    it('should return entities with related data using hasMany relation', () => {
      createEntitySelector('Job', s => s.jobs);
      const policies = createEntitySelector('Policy', s => s.policies, {
        jobs: hasMany('Job', {
          id: 'policyId',
          target: KeyTarget.Related
        })
      });
      expect(policies.getAllWithRelated(state)).toEqual([
        {
          id: 'policy1', customProperties: { cloudCred: 'beaconCred1'},
          jobs: [
            { id: 'job1', policyId: 'policy1' },
            { id: 'job2', policyId: 'policy1' }
          ]
        },
        {
          id: 'policy2', customProperties: { cloudCred: 'beaconCred2'},
          jobs: [
            { id: 'job3', policyId: 'policy2' }
          ]
        }
      ]);
    });

    it('should return entities with related data using belongsToThrough relation', () => {
      createEntitySelector<any, any>('CloudAccount', s => s.cloudAccounts);
      createEntitySelector('BeaconCloudCred', s => s.beaconCloudCreds, {
        cloudAccount: belongsTo('CloudAccount', {
          id: 'name',
          target: KeyTarget.Self
        })
      });
      const policies = createEntitySelector('Policy', s => s.policies, {
        cloudAccount: belongsToThrough('BeaconCloudCred', 'cloudAccount', {
          id: 'customProperties.cloudCred',
          target: KeyTarget.Self
        })
      });
      expect(policies.getAllWithRelated(state)).toEqual([
        {
          id: 'policy1', customProperties: { cloudCred: 'beaconCred1'},
          cloudAccount: { id: 'cloudCredName1', name: 'cloudCredName1' }
        },
        {
          id: 'policy2', customProperties: { cloudCred: 'beaconCred2'},
          cloudAccount: { id: 'cloudCredName2', name: 'cloudCredName2' }
        }
      ]);
    });

  });
});
