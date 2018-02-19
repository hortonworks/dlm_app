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
import {HttpUtil} from "../../../shared/utils/httpUtil";

@Injectable()
export class DsTagsService {
  url = "api/datasets/categories/";

  constructor(private http: Http) {
  }

  list(searchText: string, size: number): Observable<string[]> {
    return this.http
      .get(`${this.url}${searchText}?size=${size}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(res=>{
        let retArr=[];
        HttpUtil.extractData(res).forEach(data=>retArr.push(data.name));
        return retArr;
      })
      .catch(HttpUtil.handleError);
  }

  listAtlasTags(dataSetId: number) : Observable<string[]>{
    return this.http
      .get(`/api/dataset/${dataSetId}/atlas-tags`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
