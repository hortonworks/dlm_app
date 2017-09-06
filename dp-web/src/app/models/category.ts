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

// class BaseModel {
//   copy(obj:any){
//     for(var key in obj) {
//       console.log(key, this[key], obj[key]);
//       if (typeof this[key] != 'undefined' && typeof this[key] != 'function') this[key] = obj[key];
//     }
//     return this;
//   }
// }

export class Category
//  extends BaseModel
{
  id?:number;
  name: string;
  description: string;
  created?: number;
  updated?: number;
}
