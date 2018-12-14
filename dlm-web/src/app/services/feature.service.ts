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

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import {
  POLICY_EDIT, REPLICATION_ABFS_SUPPORT, REPLICATION_ADLS_SUPPORT,
  REPLICATION_WASB_SUPPORT,
  CLUSTER_SYNC_SUPPORT,
  POLICY_SNAPSHOTABLE_EDIT,
  HDFS_FILTER, REPLICATION_GCS_SUPPORT
} from 'models/features.model';
import { FEATURE_STATE } from 'constants/features.constant';
import { getAllBeaconAdminStatuses } from 'selectors/beacon.selector';
import { State } from 'reducers/index';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';

@Injectable()
export class FeatureService {

  private initialFeatureStates = {
    [POLICY_EDIT]: FEATURE_STATE.API_DRIVEN,
    [REPLICATION_WASB_SUPPORT]: FEATURE_STATE.API_DRIVEN,
    [REPLICATION_ABFS_SUPPORT]: FEATURE_STATE.DISABLED,
    [REPLICATION_ADLS_SUPPORT]: FEATURE_STATE.DISABLED,
    [CLUSTER_SYNC_SUPPORT]: FEATURE_STATE.API_DRIVEN,
    [POLICY_SNAPSHOTABLE_EDIT]: FEATURE_STATE.API_DRIVEN,
    [HDFS_FILTER]: FEATURE_STATE.API_DRIVEN,
    [REPLICATION_GCS_SUPPORT]: FEATURE_STATE.API_DRIVEN,
  };

  private features = {
    [POLICY_EDIT]: false,
    [REPLICATION_WASB_SUPPORT]: false,
    [REPLICATION_ABFS_SUPPORT]: false,
    [REPLICATION_ADLS_SUPPORT]: false,
    [CLUSTER_SYNC_SUPPORT]: false,
    [POLICY_SNAPSHOTABLE_EDIT]: false,
    [HDFS_FILTER]: false,
    [REPLICATION_GCS_SUPPORT]: false
  };

  state$ = new BehaviorSubject<any>(this.features);

  constructor(private store: Store<State>) {
    this.store.select(getAllBeaconAdminStatuses)
      .subscribe(statuses => this.proceedAdminStatuses(statuses));
  }

  private proceedAdminStatuses(statuses: BeaconAdminStatus[]) {
    Object.keys(this.features).forEach(featureName => {
      const initialState = this.initialFeatureStates[featureName];
      if (initialState === FEATURE_STATE.DISABLED) {
        this.disableFeature(featureName);
      }
      if (initialState === FEATURE_STATE.ENABLED) {
        this.enableFeature(featureName);
      }
      if (initialState === FEATURE_STATE.API_DRIVEN) {
        this.update({
          [featureName]: this.getApiFeatureStatus(featureName, statuses)
        });
      }
    });
  }

  /**
   * Add extra-handles for features here
   *
   * @param featureName
   * @param beaconAdminStatuses
   * @returns {boolean}
   */
  private getApiFeatureStatus(featureName: string, beaconAdminStatuses: BeaconAdminStatus[]) {
    return beaconAdminStatuses.some(s => s.beaconAdminStatus[featureName]);
  }

  private update(state): void {
    this.state = {
      ...this.state,
      ...state
    };
  }

  get state() {
    return this.state$.getValue();
  }

  set state(state) {
    this.state$.next(state);
  }

  enableFeature(name) {
    this.update({[name]: true} as any);
  }

  disableFeature(name) {
    this.update({[name]: false} as any);
  }

  isEnabled(name) {
    return name in this.state && this.state[name] === true;
  }

  isDisabled(name) {
    return !(name in this.state) || (name in this.state && this.state[name] === false);
  }
}
