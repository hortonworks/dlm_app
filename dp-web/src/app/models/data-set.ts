/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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
