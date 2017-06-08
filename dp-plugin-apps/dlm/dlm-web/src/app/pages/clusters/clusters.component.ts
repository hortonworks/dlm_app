import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { loadClusters } from 'actions/cluster.action';
import { loadPairings } from 'actions/pairing.action';
import { loadPolicies } from 'actions/policy.action';
import { Cluster } from 'models/cluster.model';
import { PairsCountEntity } from 'models/pairs-count-entity.model';
import { PoliciesCountEntity } from 'models/policies-count-entity.model';
import { getAllClusters } from 'selectors/cluster.selector';
import { getCountPairsForClusters } from 'selectors/pairing.selector';
import { getCountPoliciesForSourceClusters } from 'selectors/policy.selector';
import * as fromRoot from 'reducers';
import { DropdownItem } from 'components/dropdown/dropdown-item';
import { TranslateService } from '@ngx-translate/core';
import { MapData, MapConnectionStatus, Point, MapSize } from 'models/map-data';
import { AddEntityButtonComponent } from 'components/add-entity-button/add-entity-button.component';

const CLUSTERS_REQUEST_ID = '[CLUSTER_PAGE]CLUSTERS_REQUEST_ID';
const POLICIES_REQUEST_ID = '[CLUSTER_PAGE]POLICIES_REQUEST_ID';
const PAIRINGS_REQUEST_ID = '[CLUSTER_PAGE]PAIRINGS_REQUEST_ID';

@Component({
  selector: 'dlm-clusters',
  templateUrl: './clusters.component.html',
  styleUrls: ['./clusters.component.scss']
})
export class ClustersComponent implements OnInit {
  tableData$: Observable<Cluster[]>;
  mapData$: Observable<MapData[]>;
  resourceAvailability$: Observable<{canAddPolicy: boolean, canAddPairing: boolean}>;
  addOptions: DropdownItem[];
  mapSize: MapSize = MapSize.FULLWIDTH;
  canAddPairing = true;
  canAddPolicy = true;

  constructor(private store: Store<fromRoot.State>, t: TranslateService) {
    const clusters$: Observable<Cluster[]> = store.select(getAllClusters);
    const pairsCount$: Observable<PairsCountEntity> = store.select(getCountPairsForClusters);
    const policiesCount$: Observable<PoliciesCountEntity> = store.select(getCountPoliciesForSourceClusters);
    const allResources$ = Observable.combineLatest(clusters$, pairsCount$, policiesCount$);
    this.mapData$ = clusters$
      .startWith([])
      .map(clusters =>
        clusters.map(cluster =>
          new MapData(
            new Point(
              cluster.location.latitude,
              cluster.location.longitude,
              MapConnectionStatus.NA,
              cluster.name
            )
          )
        )
      );
    this.addOptions = [
      { label: t.instant('page.clusters.dropdown.cluster') },
      { label: t.instant('page.clusters.dropdown.policy') }
    ];
    this.tableData$ = allResources$
      .map(([clusters, pairsCount, policiesCount]) => {
        return clusters.map(cluster => {
          const pairsCounter = cluster.id in pairsCount &&
          'pairs' in pairsCount[cluster.id] ? pairsCount[cluster.id].pairs : 0;
          const policiesCounter = cluster.id in policiesCount &&
          'policies' in policiesCount[cluster.id] ? policiesCount[cluster.id].policies : 0;
          return {
            ...cluster,
            pairsCounter,
            policiesCounter
          };
        });
      });
      this.resourceAvailability$ = Observable
        .combineLatest(clusters$, pairsCount$)
        .map(AddEntityButtonComponent.availableActions);
  }

  ngOnInit() {
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST_ID));
    this.store.dispatch(loadPairings(PAIRINGS_REQUEST_ID));
    this.store.dispatch(loadPolicies(POLICIES_REQUEST_ID));
  }
}
