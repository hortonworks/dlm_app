/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';

import { Effect, Actions, toPayload } from '@ngrx/effects';
import { ClusterService } from 'services/cluster.service';

import {
  loadClustersSuccess,
  loadClustersFailure,
  loadClustersStatusesSuccess,
  loadClustersStatusesFailure,
  ActionTypes
} from 'actions/cluster.action';

@Injectable()
export class ClusterEffects {

  @Effect()
  loadClusters$: Observable<any> = this.actions$
    .ofType(ActionTypes.LOAD_CLUSTERS.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.clusterService.fetchClusters()
        .map(clusters => loadClustersSuccess(clusters, payload.meta))
        .catch(err => Observable.of(loadClustersFailure(err, payload.meta)));
    });

  @Effect()
  loadClustersStatuses$: Observable<any> = this.actions$
    .ofType(ActionTypes.LOAD_CLUSTERS_STATUSES.START)
    .map(toPayload)
    .switchMap(payload => {
      return this.clusterService.fetchClustersStatuses()
        .map(clusters => loadClustersStatusesSuccess(clusters, payload.meta))
        .catch(err => Observable.of(loadClustersStatusesFailure(err, payload.meta)));
    });

  constructor(private actions$: Actions, private clusterService: ClusterService) {
  }
}
