import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { ClusterService } from '../services/cluster.service';

import * as cluster from '../actions/cluster';

@Injectable()
export class ClusterEffects {
  constructor(private actions$: Actions, private clusterService: ClusterService) { }

  @Effect()
  loadClusters$: Observable<any> = this.actions$
    .ofType(cluster.ActionTypes.LOAD_CLUSTERS)
    .switchMap(() => {
        return this.clusterService.fetchClusters()
          .map(clusters => new cluster.LoadClustersSuccess(clusters))
          .catch((err) => Observable.of(new cluster.LoadClustersFailure(err)))
      }
    );
}
