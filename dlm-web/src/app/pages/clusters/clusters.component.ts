import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { LoadClusters } from '../../actions/cluster';
import { Cluster } from '../../models/cluster.model';
import { getAll } from '../../selectors/cluster';
import * as fromRoot from '../../reducers';
import { DropdownItem } from '../../components/dropdown/dropdown-item';

@Component({
  selector: 'dp-main',
  templateUrl: './clusters.component.html',
  styleUrls: ['./clusters.component.scss']
})
export class ClustersComponent implements OnInit {
  clusters$: Observable<Cluster[]>;

  addOptions = [
    <DropdownItem>{
      label: 'Cluster'
    },
    <DropdownItem>{
      label: 'Policy'
    }
  ];

  constructor(private store: Store<fromRoot.State>) {
    this.clusters$ = store.select(getAll);
  }

  ngOnInit() {
    this.store.dispatch(new LoadClusters());
  }

}
