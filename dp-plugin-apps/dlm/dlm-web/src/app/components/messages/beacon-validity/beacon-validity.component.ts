import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Cluster } from 'models/cluster.model';
import * as fromRoot from 'reducers/index';
import { getClustersWithStopppedBeacon } from 'selectors/cluster.selector';
import { TranslateService } from '@ngx-translate/core';

interface ClusterTranslate {
  [clusters: string]: string;
};

@Component({
  selector: 'dlm-beacon-validity',
  templateUrl: './beacon-validity.component.html',
  styleUrls: ['./beacon-validity.component.scss']
})
export class BeaconValidityComponent implements OnInit {
  clustersList$: Observable<ClusterTranslate>;

  private formatClustersMessage = (clusters: Cluster[]): ClusterTranslate => {
    if (clusters.length) {
      let clusterNames = clusters.map(cluster => `<strong>${cluster.name}</strong>`);
      if (clusterNames.length > 1) {
        clusterNames = [clusterNames.slice(0, clusterNames.length - 1).join(', ')].concat(clusterNames[clusterNames.length - 1]);
      }
      return { clusters: clusterNames.join(` ${this.t.instant('common.and').toLowerCase()} `) };
    }
    return { clusters: null };
  }

  constructor(private store: Store<fromRoot.State>, private t: TranslateService) {
    this.clustersList$ = store.select(getClustersWithStopppedBeacon).map(this.formatClustersMessage);
  }

  ngOnInit() {
  }
}
