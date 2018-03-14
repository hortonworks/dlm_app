/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { State } from 'reducers';
import { contains } from 'utils/array-util';
import { ListStatus } from 'models/list-status.model';
import { listFiles } from 'actions/hdfslist.action';
import { getAllFilesForClusterPath } from 'selectors/hdfs.selector';
import { AsyncActionsService } from 'services/async-actions.service';

@Injectable()
export class HdfsService {

  constructor(
    private httpClient: HttpClient,
    private store: Store<State>,
    private asyncActions: AsyncActionsService
  ) { }

  getFilesList(clusterId, path): Observable<any> {
    path = path || '/';
    return this.httpClient.get<any>(`clusters/${clusterId}/hdfs/file?path=${path}`);
  }

  checkFileEncryption(clusterId: number, filePathOrDirectory: string): Observable<boolean> {
    const findDir = (dirs: ListStatus[], fileName) => dirs.find(d => d.pathSuffix === fileName);
    if (!contains(['', '/'], filePathOrDirectory)) {
      const splits = filePathOrDirectory.split('/');
      const path = splits.length === 2 ? '/' : splits.slice(0, splits.length - 1).join('/');
      const fileName = splits.slice(-1)[0];
      const selectDirectory = this.store.select(getAllFilesForClusterPath(clusterId, path))
        .map(dirs => findDir(dirs, fileName).isEncrypted)
        .catch(_ => Observable.of(false));
      // performance optimization. Don't load directory list when path is '/'
      // because we might have it loaded
      if (path === '/') {
        return this.store.select(getAllFilesForClusterPath(clusterId, path))
          .switchMap(dirs => {
            if (dirs !== undefined) {
              return selectDirectory;
            } else {
              return this.asyncActions.dispatch(listFiles(clusterId, path))
                .concatMap(progressState => selectDirectory);
            }
          });
      } else {
        return this.asyncActions.dispatch(listFiles(clusterId, path))
          .concatMap(progressState => selectDirectory);
      }
    }
    // TODO: we cannot get encryption status for root path "/"
    return Observable.of(false);
  }

}
