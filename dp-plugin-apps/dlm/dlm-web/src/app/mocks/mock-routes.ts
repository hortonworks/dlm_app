import { RequestMethod } from '@angular/http';
import { MockRoute } from './mock-route';

/**
 * Define mock routes here
 * @see MockRoute for more info
 */
export const routes: MockRoute[] = [
  // cluster mocks
  new MockRoute('clusters', 'clusters.json'),
  new MockRoute('clusters', 'cluster.json', RequestMethod.Post),
  new MockRoute('clusters/:id', 'cluster.json'),
  new MockRoute('clusters/:id', 'cluster.json', RequestMethod.Delete),

  // policy mocks
  new MockRoute('policies', 'policies.json'),
  new MockRoute('policies/:id', 'policy.json'),
  new MockRoute('policies', 'create_policy.json', RequestMethod.Post),
  new MockRoute('policies/:id', 'policies.json', RequestMethod.Delete),

  // Pairing
  new MockRoute('pairings', 'pairings.json'),
  new MockRoute('pairings', 'create_pairing.json', RequestMethod.Post),
  new MockRoute('pairings/:id', 'unpair.json', RequestMethod.Delete),

  // Jobs
  new MockRoute('jobs', 'jobs.json'),
  new MockRoute('jobs/:id', 'job.json')
];
