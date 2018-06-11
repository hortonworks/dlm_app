/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
import { getClustersWithBeacon } from 'selectors/cluster.selector';
import { toSearchParams } from 'utils/http-util';

@Injectable()
export class HdfsService {

  constructor(
    private httpClient: HttpClient,
    private store: Store<State>,
    private asyncActions: AsyncActionsService
  ) { }

  getFilesList(clusterId, filePath): Observable<any> {
    filePath = filePath || '/';
    return this.store.select(getClustersWithBeacon).take(1).switchMap(clusters => {
      const cluster = clusters.find(c => c.id === clusterId);
      let query: any = {
        filePath
      };
      if (cluster && cluster.beaconAdminStatus) {
        const { beaconAdminStatus: { is10 } } = cluster.beaconAdminStatus;
        if (is10) {
          query = {
            path: filePath
          };
        }
      }
      const params = toSearchParams(query);
      return this.httpClient.get<any>(`clusters/${clusterId}/hdfs/file`, {params});
    });
  }

  checkFileEncryption(clusterId: number, filePathOrDirectory: string): Observable<ListStatus> {
    const findDir = (dirs: ListStatus[], fileName) => dirs.find(d => d.pathSuffix === fileName);
    if (!contains(['', '/'], filePathOrDirectory)) {
      // remove trailing slash
      const splits = filePathOrDirectory.replace(/(.+)\/$/, '$1').split('/');
      const path = splits.length === 2 ? '/' : splits.slice(0, splits.length - 1).join('/');
      const fileName = splits.slice(-1)[0];
      const selectDirectory = () => this.store.select(getAllFilesForClusterPath(clusterId, path))
        .map(dirs => findDir(dirs, fileName))
        .catch(_ => Observable.of({} as ListStatus));
      // performance optimization. Don't load directory list when path is '/'
      // because we might have it loaded
      if (path === '/') {
        return this.store.select(getAllFilesForClusterPath(clusterId, path))
          .switchMap(dirs => {
            if (dirs !== undefined) {
              return selectDirectory();
            } else {
              return this.asyncActions.dispatch(listFiles(clusterId, path))
                .concatMap(progressState => selectDirectory());
            }
          });
      } else {
        return this.asyncActions.dispatch(listFiles(clusterId, path))
          .concatMap(progressState => selectDirectory());
      }
    }
    // TODO: we cannot get encryption status for root path "/"
    return Observable.of({} as ListStatus);
  }

  checkSnapshottableAncestor(clusterId, filePathOrDirectory: string): Observable<ListStatus> {
    const findDir = (dirs: ListStatus[], fileName) => dirs.find(d => d.pathSuffix === fileName);
    if (!contains(['', '/'], filePathOrDirectory)) {
      // remove trailing slash
      const splits = filePathOrDirectory.replace(/(.+)\/$/, '$1').split('/');
      const path = splits.length <= 3 ? '/' : splits.slice(0, splits.length - 2).join('/');
      const fileName = splits.length === 2 ? splits.slice(-1)[0] : splits.slice(-2)[0];
      const selectDirectory = () => this.store.select(getAllFilesForClusterPath(clusterId, path))
        .map(dirs => findDir(dirs, fileName))
        .take(1)
        .catch(_ => Observable.of({} as ListStatus));
      const selectAndRecheck = () => selectDirectory()
        .switchMap(dir => {
          if (!dir) {
            return Observable.of(null);
          }
          if (dir.snapshottable) {
            return Observable.of(dir);
          }
          return this.checkSnapshottableAncestor(clusterId, path);
        });
      if (!fileName) {
        return Observable.of(null);
      }
      return this.store.select(getAllFilesForClusterPath(clusterId, path))
        .switchMap((dirs: ListStatus[]) => {
          if (dirs !== undefined) {
            return selectAndRecheck();
          }
          return this.asyncActions.dispatch(listFiles(clusterId, path))
            .concatMap(progressState => {
              if (progressState.error) {
                return Observable.of(null);
              }
              return selectAndRecheck();
            });
        });
    }
    // TODO: we cannot get snapshottable status for root path "/"
    return Observable.of(null);
  }

}
