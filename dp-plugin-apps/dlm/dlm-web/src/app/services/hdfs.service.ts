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

@Injectable()
export class HdfsService {

  constructor(private httpClient: HttpClient) {}

  getFilesList(clusterId, path): Observable<any> {
    return this.httpClient.get<any>(`clusters/${clusterId}/hdfs/file?path=${path}`);
  }

}
