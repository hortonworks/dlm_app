import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { LoadClusters } from '../../../actions/cluster';
import { Cluster } from '../../../models/cluster.model';
import { getAllClusters } from '../../../selectors/cluster';
import * as fromRoot from '../../../reducers';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'create-pairing',
  templateUrl: './create-pairing.component.html',
  styleUrls: ['./create-pairing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreatePairingComponent implements OnInit {
  firstSetClusters$: Observable<Cluster[]>;
  secondSetClusters$: Observable<Cluster[]>;
  createPairingForm: FormGroup;

  selectedFirstClusterId = '';
  selectedSecondClusterId = '';
  selectedFirstCluster: Cluster;
  selectedSecondCluster: Cluster;

  isButtonClicked = false;

  constructor(private store: Store<fromRoot.State>, t: TranslateService, private formBuilder: FormBuilder) {
    this.firstSetClusters$ = store.select(getAllClusters);
    this.secondSetClusters$ = store.select(getAllClusters);
  }

  ngOnInit() {
    this.createPairingForm = this.formBuilder.group({
      firstCluster: '',
      secondCluster: ''
    });
    this.store.dispatch(new LoadClusters());
    this.firstSetClusters$.subscribe(clusters => {
      if ( clusters && clusters.length > 0 ) {
        this.selectFirstCluster(clusters[0]);
      }
    });
    this.secondSetClusters$.subscribe(clusters => {
      if ( clusters && clusters.length > 0 ) {
        this.selectSecondCluster(clusters[0]);
      }
    });
  }

  handleSubmit(createPairingForm: FormGroup) {
    console.log(createPairingForm);
    this.isButtonClicked = true;
  }

  selectFirstCluster(cluster: Cluster) {
    this.selectedFirstClusterId = cluster.id;
    this.selectedFirstCluster = cluster;
  }

  selectSecondCluster(cluster: Cluster) {
    this.selectedSecondClusterId = cluster.id;
    this.selectedSecondCluster = cluster;
  }
}
