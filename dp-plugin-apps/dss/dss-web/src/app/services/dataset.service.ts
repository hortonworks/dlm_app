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
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpUtil} from '../shared/utils/httpUtil';
import {DataSetAndCategories, DataSetAndCategoryIds, DataSet} from '../models/data-set';


@Injectable()
export class DataSetService {
  url = 'api/datasets';

  constructor(private http:Http) {}

  list():Observable<DataSet[]> {
    return this.http
      .get(this.url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  query(
    params: {
      name?: string
    }
  ):Observable<DataSet[]> {
    const query = Object.keys(params).reduce((accumulator, cParamKey) => `${accumulator}&${cParamKey}=${params[cParamKey]}`, '');
    return this.http
      .get(`${this.url}?${query}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  post(data: DataSetAndCategoryIds): Observable<DataSetAndCategories> {
    data.dataset.createdBy=0;
    return this.http
      .post(`${this.url}`, data, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  get(datasetId: number): Observable<DataSetAndCategories> {
    return this.http
      .get(`${this.url}/${datasetId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  delete(datasetId: number): Observable<DataSetAndCategories> {
    return this.http
      .delete(`${this.url}/${datasetId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
