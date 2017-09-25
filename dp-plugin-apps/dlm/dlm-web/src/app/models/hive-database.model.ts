/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export interface HiveTable {
  id: string;    // added on UI
  name: string;
  clusterId?: string; // added on UI
  databaseEntityId?: string; // added on UI
}

export interface HiveDatabase {
  name: string;
  entityId?: string; // added on UI
  tables?: HiveTable[]; // added on UI
}
