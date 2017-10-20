/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export interface HiveTableUI {
  id: string;
  clusterId: string;
  databaseEntityId: string;
}

export interface HiveTable extends HiveTableUI {
  name: string;
}

export interface HiveDatabaseUI {
  entityId: string;
  tables?: HiveTable[];
  name: string;
  clusterId: number;
}
export interface HiveDatabase extends HiveDatabaseUI {
  database: string;
}
