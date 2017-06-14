import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {WorkspaceService} from '../../../services/workspace.service';
import {Workspace} from '../../../models/workspace';
import {TabStyleType} from '../../../shared/tabs/tabs.component';
import {WorkspaceDTO} from '../../../models/workspace-dto';
import {Alerts} from '../../../shared/utils/alerts';
import {DialogBox} from '../../../shared/utils/dialog-box';
import {CollapsibleNavService} from '../../../services/collapsible-nav.service';
import {PersonaTabs} from '../../../models/header-data';

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

  constructor(private router: Router,
              private workspaceService: WorkspaceService) { }

  addWorkspace() {
    this.router.navigateByUrl('/workspace/(dialog:add-workspace/new)');
  }

  editWorkspace($event, workspacesDTO: WorkspaceDTO) {
    if ($event.target.nodeName !== 'I') {
      this.router.navigate(['/workspace/' + workspacesDTO.workspace.name + '/assets']);
    }
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
