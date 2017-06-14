import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Observable} from 'rxjs/Observable';

import {WorkspaceService} from '../../../../services/workspace.service';
import {Workspace} from '../../../../models/workspace';
import {Alerts} from '../../../../shared/utils/alerts';
import {ClusterService} from '../../../../services/cluster.service';
import {Cluster} from '../../../../models/cluster';

@Component({
  selector: 'dp-add-workspace',
  templateUrl: './add-workspace.component.html',
  styleUrls: ['./add-workspace.component.scss']
})
export class AddWorkspaceComponent implements OnInit {

  workspace = new Workspace();
  clusterServiceObservable: Observable<Cluster[]>;
  
  constructor(private workspaceService: WorkspaceService, private clusterService: ClusterService,
              private router: Router) { }

  ngOnInit() {
    this.clusterServiceObservable = this.clusterService.list();
  }

  cancel() {
     this.router.navigateByUrl('/workspace');
  }

  save() {
    this.workspaceService.save(this.workspace).subscribe(() => {
      Alerts.showSuccessMessage('Added workspace ' + this.workspace.name);
      this.workspaceService.dataChanged.next();
      this.router.navigateByUrl('/workspace');
    });
  }

  updateVal() {
    this.workspace.source = parseInt(this.workspace.source + '', 10);
  }
}
