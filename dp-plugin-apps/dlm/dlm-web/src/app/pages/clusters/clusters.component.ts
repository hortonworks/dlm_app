import { Component, OnInit, OnDestroy } from '@angular/core';
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

const REQUEST_ID = 'CLUSTERS_PAGE';

@Component({
  selector: 'dlm-clusters',
  templateUrl: './clusters.component.html',
  styleUrls: ['./clusters.component.scss']
})
export class ClustersComponent implements OnInit, OnDestroy {
  clusters$: Observable<Cluster[]>;
  policiesCount$: Observable<PoliciesCountEntity>;
  pairsCount$: Observable<PairsCountEntity>;
  clustersSubscription$;
  clusters: Cluster[];
  addOptions: DropdownItem[];
  mapSize: MapSize;
  locations: MapData[] = [];

  constructor(private store: Store<fromRoot.State>, t: TranslateService) {
    this.clusters$ = store.select(getAllClusters);
    this.pairsCount$ = store.select(getCountPairsForClusters);
    this.policiesCount$ = store.select(getCountPoliciesForSourceClusters);
    this.addOptions = [
      { label: t.instant('page.clusters.dropdown.cluster') },
      { label: t.instant('page.clusters.dropdown.policy') }
    ];
  }

  ngOnInit() {
    this.store.dispatch(loadClusters(REQUEST_ID));
    this.store.dispatch(loadPairings());
    this.store.dispatch(loadPolicies(REQUEST_ID));
    this.mapSize = MapSize.FULLWIDTH;
    this.clustersSubscription$ = this.clusters$.subscribe(clusters => {
      this.clusters = clusters;
      this.locations = [];
      clusters.forEach( cluster => {
        this.locations.push(
          new MapData(
            new Point(
              cluster.location.latitude,
              cluster.location.longitude,
              MapConnectionStatus.NA,
              cluster.name
            )
          )
        );
      });
    });
  }

  ngOnDestroy() {
    this.clustersSubscription$.unsubscribe();
  }
}
