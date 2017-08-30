/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import {Observable} from 'rxjs/Observable';

import {WorkspaceService} from '../../../../services/workspace.service';
import {Workspace} from '../../../../models/workspace';
import {Alerts} from '../../../../shared/utils/alerts';
import {ClusterService} from '../../../../services/cluster.service';
import {Cluster} from '../../../../models/cluster';
import {TranslateService} from '@ngx-translate/core/src/translate.service';

@Component({
  selector: 'dp-add-workspace',
  templateUrl: './add-workspace.component.html',
  styleUrls: ['./add-workspace.component.scss']
})
export class AddWorkspaceComponent implements OnInit {

  workspace = new Workspace();
  clusterServiceObservable: Observable<Cluster[]>;
  @ViewChild('workspaceForm') workspaceForm: NgForm;

  constructor(private workspaceService: WorkspaceService,
              private clusterService: ClusterService,
              private translate: TranslateService,
              private router: Router) { }

  ngOnInit() {
    this.clusterServiceObservable = this.clusterService.list();
  }

  cancel() {
     this.router.navigateByUrl('analytics/workspace');
  }

  save() {
    if (!this.workspaceForm.form.valid) {
      this.translate.get('common.defaultRequiredFields').subscribe(msg => Alerts.showErrorMessage(msg));
      return;
    }
    this.workspaceService.save(this.workspace).subscribe(() => {
      Alerts.showSuccessMessage('Added workspace ' + this.workspace.name);
      this.workspaceService.dataChanged.next();
      this.router.navigateByUrl('analytics/workspace');
    });
  }

  updateVal() {
    this.workspace.source = parseInt(this.workspace.source + '', 10);
  }
}
