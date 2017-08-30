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

import { Injectable } from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {Lineage} from '../models/lineage';
import {TypeDefs} from '../models/type-defs';

import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class AtlasService {
  uri = '/api/assets';

  constructor(private http: Http) { }

  getLineage(clusterId: string, guid: string): Observable<any> {
    const uri = `${this.uri}/lineage/${clusterId}/${guid}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getEntityTypeDefs(clusterId: string, type: string): Observable<TypeDefs> {
    const uri = `${this.uri}/typeDefs/${clusterId}/${type}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
