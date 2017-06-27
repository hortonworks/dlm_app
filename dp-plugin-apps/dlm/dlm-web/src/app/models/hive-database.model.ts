export interface HiveTable {
  id: string;
  name: string;
  databaseId: string;
  clusterId?: string; // added on UI
  databaseEntityId?: string; // added on UI
}

export interface HiveDatabase {
  id: string;
  name: string;
  entityId?: string; // added on UI
  tables?: HiveTable[]; // aded on UI
};
