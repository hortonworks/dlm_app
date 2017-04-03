import { Component, OnInit } from '@angular/core';
import { ClusterService } from '../../services/cluster.service';

@Component({
  selector: 'dp-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private cluster: ClusterService) { }

  ngOnInit() {
    this.cluster.getClusters().subscribe(r => console.debug('response', r));
  }

}
