/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { RequestMethod } from '@angular/http';
import { MockRoute } from './mock-route';

/**
 * Define mock routes here
 * @see MockRoute for more info
 */
export const routes: MockRoute[] = [
  // cluster mocks
  new MockRoute('clusters', 'clusters.json'),
  new MockRoute('clusters', 'cluster.json', 'POST'),
  new MockRoute('clusters/status', 'clusters_status.json'),
  new MockRoute('clusters/:id', 'cluster.json'),
  new MockRoute('clusters/:id', 'cluster.json', 'DELETE'),

  // policy mocks
  new MockRoute('policies', 'policies.json'),
  new MockRoute('policies/:id', 'policy.json'),
  new MockRoute('clusters/:clusterId/policy/:policyName/submit', 'create_policy.json', 'POST'),
  new MockRoute('clusters/:clusterId/policy/:policyName/schedule', 'create_policy.json', 'PUT'),
  new MockRoute('clusters/:clusterId/policy/:policyName/resume', 'create_policy.json', 'PUT'),
  new MockRoute('policies/:id', 'policies.json', 'DELETE'),

  // Pairing
  new MockRoute('pairs', 'pairings.json'),
  new MockRoute('pair', 'create_pairing.json', 'POST'),
  new MockRoute('unpair', 'unpair.json', 'POST'),

  // Jobs
  new MockRoute('clusters/:clusterId/policy/:policyName/jobs', 'jobs.json'),

  // Events
  new MockRoute('events', 'events.json'),

  // HDFS files list
  new MockRoute('clusters/:clusterId/hdfs/file', 'files.json'),

  // HIVE databases
  new MockRoute('clusters/:clusterId/hive/databases', 'hive_databases.json'),

  // HIVE tables related to database
  new MockRoute('clusters/:clusterId/hive/database/default/tables', 'hive_default_tables.json'),
  new MockRoute('clusters/:clusterId/hive/database/testdb/tables', 'hive_testdb_tables.json'),

  // Event log for specific policy instance Id and cluster Id
  new MockRoute('clusters/:clusterId/logs', 'event_log.json'),

  // User Detail
  new MockRoute('api/identity', 'user_detail.json'),

  // Beacon admin status
  new MockRoute('beacon/admin/status', 'admin_status.json'),

  // Yarn queues
  new MockRoute('clusters/:clusterId/yarn/queues', 'yarn_queues.json'),

  // cloud accounts
  new MockRoute('store/credentials', 'cloud_credentials.json')
];
