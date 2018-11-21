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

import { requestType } from '../utils/type-action';
import { ActionWithPayload } from 'actions/actions.type';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';
import { HiveDatabase } from 'models/hive-database.model';

export const ActionTypes = {
  LOAD_DATABASES: requestType('LOAD_DATABASES'),
  LOAD_TABLES: requestType('LOAD_TABLES'),
  LOAD_FULL_DATABASES: requestType('LOAD_FULL_DATABASES')
};

export const loadDatabases = (clusterId, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_DATABASES.START,
  payload: { clusterId, meta }
});
export const loadDatabasesSuccess = (databases: HiveDatabase[], meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_DATABASES.SUCCESS,
  payload: { response: databases, meta}
});
export const loadDatabasesFail = (error, meta = {}): ActionFailure => ({
  type: ActionTypes.LOAD_DATABASES.FAILURE,
  payload: { error, meta}
});

export const loadTables = ({clusterId, databaseId}, meta = {}) => ({
  type: ActionTypes.LOAD_TABLES.START,
  payload: { clusterId, databaseId, meta }
});
export const loadTablesSuccess = (tables: any, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_TABLES.SUCCESS,
  payload: { response: tables, meta}
});
export const loadTablesFail = (error, meta = {}): ActionFailure => ({
  type: ActionTypes.LOAD_TABLES.FAILURE,
  payload: { error, meta }
});

export const loadFullDatabases = (clusterId, meta = {}): ActionWithPayload<any> => ({
  type: ActionTypes.LOAD_FULL_DATABASES.START,
  payload: { clusterId, meta }
});
