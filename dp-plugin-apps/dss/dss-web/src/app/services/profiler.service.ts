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
import {AssetCollectionDashboard} from '../models/asset-collection-dashboard';

@Injectable()
export class ProfilerService {
  constructor(private http: Http) {
  }

  assetCollectionStats(...statsFor: string[]): Observable<AssetCollectionDashboard> {
    const url = '';
    return Observable.create(observer => {
      observer.next(AssetCollectionDashboard.getData());
      observer.complete();
    });
  }
}