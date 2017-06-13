import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {WorkspaceService} from '../../../services/workspace.service';
import {Workspace} from '../../../models/workspace';
import {TabStyleType} from '../../../shared/tabs/tabs.component';
import {WorkspaceDTO} from '../../../models/workspace-dto';
import {Alerts} from '../../../shared/utils/alerts';
import {DialogBox} from '../../../shared/utils/dialog-box';

export enum ToggleView {
  TABLE, GRID
}

@Component({
  selector: 'dp-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  toggleView = ToggleView;
  workspacesDTOS: WorkspaceDTO[] = [];
  tabType = TabStyleType;

  tabImages = {'TABLE': 'fa-list-ul', 'GRID': 'fa-th'};

  constructor(private workspaceService: WorkspaceService, private router: Router) { }

  addWorkspace() {
    this.router.navigateByUrl('/workspace/(dialog:add-workspace/new)');
  }

  delete(name: string) {
    DialogBox.showConfirmationMessage('Do you wish to delete workspace ' + name).subscribe(result => {
      if (result) {
        this.workspaceService.delete(name).subscribe(() => {
          Alerts.showSuccessMessage('Deleted workspace ' + name);
          this.workspaceService.dataChanged.next();
        });
      }
    });
  }

  getWorkspaces() {
    this.workspaceService.listDTO().subscribe((data) => {
      this.workspacesDTOS = data.sort((dto1, dto2) => dto1.workspace.name.localeCompare(dto2.workspace.name));
    });
  }

  ngOnInit() {
    this.workspaceService.dataChanged$.subscribe(() => {
      this.getWorkspaces();
    });
    this.getWorkspaces();
  }
}
