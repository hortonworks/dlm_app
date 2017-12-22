/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { type, requestType } from '../utils/type-action';
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
