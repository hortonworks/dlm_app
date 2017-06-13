import { type, requestType } from '../utils/type-action';
import { Action } from '@ngrx/store';
import { ActionSuccess, ActionFailure } from 'utils/extended-actions.type';
import { HiveDatabase } from 'models/hive-database.model';

export const ActionTypes = {
  LOAD_DATABASES: requestType('LOAD_DATABASES'),
  LOAD_TABLES: requestType('LOAD_TABLES'),
  LOAD_FULL_DATABASES: requestType('LOAD_FULL_DATABASES')
};

export const loadDatabases = (clusterId, meta = {}): Action => ({
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

export const loadTables = (databaseId, meta = {}) => ({
  type: ActionTypes.LOAD_TABLES.START,
  payload: { databaseId, meta }
});
export const loadTablesSuccess = (tables: any, meta = {}): ActionSuccess => ({
  type: ActionTypes.LOAD_TABLES.SUCCESS,
  payload: { response: tables, meta}
});
export const loadTablesFail = (error, meta = {}): ActionFailure => ({
  type: ActionTypes.LOAD_TABLES.FAILURE,
  payload: { error, meta }
});

export const loadFullDatabases = (clusterId, meta = {}): Action => ({
  type: ActionTypes.LOAD_FULL_DATABASES.START,
  payload: { clusterId, meta }
});
