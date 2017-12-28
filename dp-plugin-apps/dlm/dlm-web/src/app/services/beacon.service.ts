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

import { mapResponse } from 'utils/http-util';

@Injectable()
export class BeaconService {

  private makeAdminStatusId(status) {
    return status.clusterId;
  }

  private getAdminPlugins(status): string[] {
    return status.beaconAdminStatus.plugins.split(',');
  }

  private decorateStatuses(statusList) {
    return statusList.map(status => ({
      ...status,
      plugins: this.getAdminPlugins(status),
      id: this.makeAdminStatusId(status)
    }));
  }

  fetchBeaconAdminStatus() {
    return this.httpClient.get<any>('beacon/admin/status')
      .map(response => ({...response, response: this.decorateStatuses(response.response)}));
  }

  constructor(private httpClient: HttpClient) { }
}
