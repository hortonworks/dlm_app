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
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Location} from '../models/location';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class LocationService {
  url = 'api/locations';

  constructor(private http:Http) {}

  retrieve(locationId: number): Observable<Location> {
    return this.http
      .get(`${this.url}/${locationId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  retrieveOptions(query: string): Observable<Location[]> {
    return this.http
      .get(`${this.url}?query=${query}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
