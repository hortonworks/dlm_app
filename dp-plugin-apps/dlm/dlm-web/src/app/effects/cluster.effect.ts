import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';

import { Effect, Actions, toPayload } from '@ngrx/effects';
import { ClusterService } from 'services/cluster.service';

import {
   loadClustersSuccess, loadClustersFailure, LoadClusterSuccess, LoadClusterFailure, ActionTypes
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

  @Effect() loadCluster$: Observable<any> = this.actions$
    .ofType(ActionTypes.LOAD_CLUSTER)
    .switchMap(action => {
      return this.clusterService.fetchCluster(action.entityId)
        .map(cluster => new LoadClusterSuccess(cluster))
        .catch(err => Observable.of(new LoadClusterFailure(err)));
    });

  constructor(private actions$: Actions, private clusterService: ClusterService) { }
}
