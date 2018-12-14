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

import { MockRoute } from './mock-route';

const errorResponse = (message) => {
  throw {error: { message: `Failed with ${JSON.stringify({ message, code: 500 })}`}};
};

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
  new MockRoute('clusters/:clusterId/policy/:policyName', (request) => {
    const policyName = request.url.split('/').slice(-1)[0];
    if (policyName === 'tde-enabled') {
      return errorResponse('Update error demo');
    }
    return 'post_action.json';
  }, 'PUT'),
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
  new MockRoute('store/credentials', 'cloud_credentials.json'),

  // beacon cloud creds
  new MockRoute('cluster/cloudCredentials', 'beacon_cloud_creds.json'),

  // update cloud account
  new MockRoute('store/credential', (request) => {
    const { body } = request;
    if (body.id === 'fails-on-edit') {
      return 'update_cloud_credential_failure.json';
    }
    return 'update_cloud_credential.json';
  }, 'PUT'),

  // delete cloud account
  new MockRoute('store/credential/:cloudAccountId', 'delete_cloud_credential.json', 'DELETE'),

  // sync cloud account
  new MockRoute('store/credential/sync', 'sync_cloud_credential.json', 'PUT'),

  // beacon cloud accounts with policies
  new MockRoute('cluster/cloudCredWithPolicies', 'cloud_cred_with_policies.json'),

  // accounts statuses
  new MockRoute('cloud/accounts/status', 'accounts_status.json'),

  // beacon config status
  new MockRoute('clusters/beacon/config/status', 'beacon_config_status.json'),

  // validate cloud account
  new MockRoute('cloud/userIdentity', 'cloud_user_identity.json', 'POST'),

  // add cloud account
  new MockRoute('store/credential', 'store_credential.json', 'POST'),

  // ambari privilege
  new MockRoute('ambariPrivelege', 'ambari_privileges.json'),

  // stale cluster status
  new MockRoute('clusters/beacon/stale/status', 'stale_cluster_status.json'),

  // DLM app properties
  new MockRoute('dlmProperties', 'dlm_properties.json'),

  // knu services
  new MockRoute('api/services', 'knu_services.json'),

  // ga properties
  new MockRoute('api/ga/properties', 'ga.json'),

  // sync cluster with single unreachable beacon
  new MockRoute('clusters/sync/3', 'sync_cluster_unreachable.json', 'PUT'),

  // sync cluster with few unreachable beacons
  new MockRoute('clusters/sync/5', 'sync_cluster_unreachable_multi.json', 'PUT'),
];
