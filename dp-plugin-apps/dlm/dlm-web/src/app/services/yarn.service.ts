/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { YarnQueueResponse } from 'models/yarnqueues.model';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class YarnService {

  constructor(private httpClient: HttpClient) { }

  fetchYarnQueues(clusterId: number): Observable<YarnQueueResponse> {
    return this.httpClient.get<YarnQueueResponse>(`clusters/${clusterId}/yarn/queues`);
  }
}
