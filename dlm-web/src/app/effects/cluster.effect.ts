import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { ClusterService } from 'services/cluster.service';

import {
   LoadClustersSuccess, LoadClustersFailure, LoadClusterSuccess, ActionTypes
 } from 'actions/cluster.action';

@Injectable()
export class ClusterEffects {

  @Effect()
  loadClusters$: Observable<any> = this.actions$
    .ofType(ActionTypes.LOAD_CLUSTERS)
    .switchMap(() => {
      return this.clusterService.fetchClusters()
        .map(clusters => new LoadClustersSuccess(clusters))
        .catch(err => Observable.of(new LoadClustersFailure(err)));
    });

  @Effect() loadCluster$: Observable<any> = this.actions$
    .ofType(ActionTypes.LOAD_CLUSTER)
    .switchMap(action => {
      return this.clusterService.fetchCluster(action.entityId)
        .map(cluster => new LoadClusterSuccess(cluster));
    });

  constructor(private actions$: Actions, private clusterService: ClusterService) { }
}
