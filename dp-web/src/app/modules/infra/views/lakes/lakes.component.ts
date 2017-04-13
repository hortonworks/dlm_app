import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

import { LakeService } from '../../../../services/lake.service';

import { Lake } from '../../../../models/lake';
import { Cluster } from '../../../../models/cluster';

@Component({
  selector: 'dp-infra-lakes',
  templateUrl: './lakes.component.html',
  styleUrls: ['./lakes.component.scss']
})
export class LakesComponent implements OnInit {

  lakes: {
    data: Lake,
    clusters: Cluster[]
  }[];

  constructor(
    private router: Router,
    private lakeService: LakeService,
  ) { }

  ngOnInit() {
    this.lakeService.listWithClusters()
      .subscribe(lakes => this.lakes = lakes);
  }

}
