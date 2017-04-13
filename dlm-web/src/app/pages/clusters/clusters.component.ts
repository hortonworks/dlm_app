import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { LoadClusters } from '../../actions/cluster';
import { Cluster } from '../../models/cluster.model';
import { getAllClusters } from '../../selectors/cluster';
import * as fromRoot from '../../reducers';
import { DropdownItem } from '../../components/dropdown/dropdown-item';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dp-main',
  templateUrl: './clusters.component.html',
  styleUrls: ['./clusters.component.scss']
})
export class ClustersComponent implements OnInit {
  clusters$: Observable<Cluster[]>;

  addOptions: DropdownItem[]; 

  constructor(private store: Store<fromRoot.State>, t: TranslateService) {
    this.clusters$ = store.select(getAllClusters);
    this.addOptions = [
      { label: t.instant("page.clusters.dropdown.cluster") },
      { label: t.instant("page.clusters.dropdown.policy") }
    ];
  }

  ngOnInit() {
    this.store.dispatch(new LoadClusters());
  }

}
