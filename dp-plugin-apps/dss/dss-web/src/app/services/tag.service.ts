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

import {Injectable} from "@angular/core";
import {Http, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import {HttpUtil} from "../shared/utils/httpUtil";
import {DatasetTag} from "../models/dataset-tag";

@Injectable()
export class DatasetTagService {
  url = 'api/dataset-tag/list';

  constructor(private http: Http) {
  }

  public list(text:string, bookmarkFilter: boolean): Observable<DatasetTag[]> {

    let filterParam = '';
    if(bookmarkFilter){
      filterParam = '&filter=bookmark'
    }
    return this.http
      .get(`${this.url}?search=${text}${filterParam}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);

    // return Observable.create(observer => {
    //   setTimeout(()=>observer.next(data), 300);
    // });

  }
}
// Tags must have unique name.
var data = [{"name":"All", "count":895}
  ,  {"name":"Favourites", "count":53}
  ,  {"name":"Dataset01", "count":5}
  ,  {"name":"Classified", "count":15}
  ,  {"name":"Sales", "count":10}
  ,  {"name":"Marketing", "count":7}
  ,  {"name":"Finance", "count":22}
  ,  {"name":"HRD", "count":50}
  ,  {"name":"My Datasets", "count":201}
  ,  {"name":"Block", "count":53}
  ,  {"name":"Bla", "count":45}
  ,  {"name":"Awesome", "count":12}
  ,  {"name":"Recent", "count":342}
  ,  {"name":"Old", "count":23}

];
