import {Category} from "./category";

export class DataSet {
  id?:number;
  name: string;
  description: string;
  datalakeId: number;
  permissions: string;
  createdBy?: number;
  createdOn? : number;
  lastModified?: number;
}

export class DataSetAndCategories {
  dataset : DataSet;
  categories : Category[]
}

export class DataSetAndCategoryIds {
  dataset : DataSet;
  categories : number[]
}
