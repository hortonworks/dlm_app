export interface ListStatus {
  accessTime?: number;
  blockSize?: number;
  childrenNum?: number;
  fileId?: number;
  group?: string;
  length?: number;
  modificationTime?: number;
  owner?: string;
  pathSuffix: string;
  permission?: number;
  replication?: number;
  storagePolicy?: number;
  type?: string;
}
