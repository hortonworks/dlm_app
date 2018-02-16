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

import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpUtil} from '../shared/utils/httpUtil';
import {Favourite, FavouriteWithTotal} from "../components/dataset/models/richDatasetModel";

@Injectable()
export class FavouriteService {
  constructor(private http:Http) { }

  add(favourite: Favourite): Observable<FavouriteWithTotal> {
    return this.http
      .post(`api/${favourite.userId}/favourites/${favourite.datasetId}`, favourite, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  delete(userId: number, favId: number, datasetId: number) : Observable<any> {
    return this.http
      .delete(`api/${userId}/favourites/${favId}?datasetId=${datasetId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
