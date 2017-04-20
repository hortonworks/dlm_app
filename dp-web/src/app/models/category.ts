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
