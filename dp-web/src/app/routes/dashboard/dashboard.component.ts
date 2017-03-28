import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { LakeService } from '../../services/lake.service';
import { ClusterService } from '../../services/cluster.service';

@Component({
  selector: 'dp-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private router: Router,
    private lakeService: LakeService,
    private clusterService: ClusterService,
  ) { }

  ngOnInit() {
    const rxLakes = this.lakeService.list();

    rxLakes.flatMap(lakes => Observable.zip(lakes.map(cLake => this.clusterService.list({lakeId: cLake.id}))))
  }

}
