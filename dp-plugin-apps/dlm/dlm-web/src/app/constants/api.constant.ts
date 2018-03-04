/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export const API_PREFIX = '/dlm/api/';
export const POLL_INTERVAL = 8000;
// this is default value to get all policies within single request
// todo: remove this with server side pagination
export const ALL_POLICIES_COUNT = 200;

export enum CRUD_ACTIONS {
  CREATE = 'CREATE',
  READ   = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}
