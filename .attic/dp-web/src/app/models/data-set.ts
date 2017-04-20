import {DataFilter} from './data-filter';

// export class DataSet {
//     name: string;
//     category: string;
//     ambariHost: string;
//     dataCenter: string;
//     description: string;
//     permissions: string;
//     userName: string;
//     lastModified: string;
//     hiveFilters: DataFilter[] = [];
//     hBaseFilters: DataFilter[] = [];
//     fileFilters: DataFilter[] = [];
//     properties: {[key: string]: string} = {};
//
//     // objectCount: number;
//     // lastUpdated: string;
// }


export class DataSet {
  name: string;
  description: string;
  category: string;
  dataLakeId: number;
  permissions: string;
  userId: number;
  createdOn : number;
  lastModified: number;
  customProps: {[key: string]: string} = {};
}
