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
  new MockRoute('clusters/status', 'clusters_status.json'),
  new MockRoute('clusters/:id', 'cluster.json'),
  new MockRoute('clusters/:id', 'cluster.json', RequestMethod.Delete),

  // policy mocks
  new MockRoute('policies', 'policies.json'),
  new MockRoute('policies/:id', 'policy.json'),
  new MockRoute('clusters/:clusterId/policy/:policyName/submit', 'create_policy.json', RequestMethod.Post),
  new MockRoute('clusters/:clusterId/policy/:policyName/schedule', 'create_policy.json', RequestMethod.Put),
  new MockRoute('policies/:id', 'policies.json', RequestMethod.Delete),

  // Pairing
  new MockRoute('pairs', 'pairings.json'),
  new MockRoute('pair', 'create_pairing.json', RequestMethod.Post),
  new MockRoute('unpair', 'unpair.json', RequestMethod.Post),

  // Jobs
  new MockRoute('clusters/:clusterId/policy/:policyName/jobs', 'jobs.json'),

  // Events
  new MockRoute('events', 'events.json'),

  // HDFS files list
  new MockRoute('clusters/:clusterId/webhdfs/file', 'files.json'),

  // HIVE databases
  new MockRoute('clusters/:clusterId/hive/databases', 'hive_databases.json'),

  // HIVE tables related to database
  new MockRoute('clusters/:clusterId/hive/database/default/tables', 'hive_default_tables.json'),
  new MockRoute('clusters/:clusterId/hive/database/testdb/tables', 'hive_testdb_tables.json'),

  // Event log for specific policy instance Id and cluster Id
  new MockRoute('clusters/:clusterId/logs', 'event_log.json')
];
