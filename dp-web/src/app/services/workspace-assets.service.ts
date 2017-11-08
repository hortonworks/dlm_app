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
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from "rxjs";
import {Subject} from 'rxjs/Subject';
import {Workspace} from '../models/workspace';
import {HttpUtil} from '../shared/utils/httpUtil';
import {WorkspaceDTO} from '../models/workspace-dto';
import {WorkspaceAsset} from '../models/workspace-assets';

@Injectable()
export class WorkspaceAssetsService {
  private postURL = 'api/workspaces/assets';
  private getURL = 'api/workspaces/:id/assets';

  defaultHeaders = {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};

  dataChanged = new Subject<boolean>();
  dataChanged$ = this.dataChanged.asObservable();

  constructor(private http: Http) {
  }

  listAssets(workspaceId: number): Observable<WorkspaceAsset[]> {
    let getURL = this.getURL.replace(/:id/, workspaceId +'');
    return this.http.get(getURL, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  save(workspaceAsset: WorkspaceAsset): Observable<WorkspaceAsset> {
    return this.http.post(this.postURL, workspaceAsset, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
