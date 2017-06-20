import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {Subscription} from 'rxjs/Rx';

import {WorkspaceService} from '../../../services/workspace.service';
import {TabStyleType} from '../../../shared/tabs/tabs.component';
import {WorkspaceDTO} from '../../../models/workspace-dto';
import {Alerts} from '../../../shared/utils/alerts';
import {DialogBox} from '../../../shared/utils/dialog-box';

declare var zeppelinURL;

export enum ToggleView {
  TABLE, GRID
}

@Component({
  selector: 'dp-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  toggleView = ToggleView;
  selectedViewType = ToggleView.TABLE;
  workspaceChanged: Subscription;
  workspacesDTOS: WorkspaceDTO[] = [];
  tabType = TabStyleType;

  tabImages = {'TABLE': 'fa-list-ul', 'GRID': 'fa-th'};

  constructor(private router: Router,
              private workspaceService: WorkspaceService) {}

  addWorkspace() {
    this.router.navigateByUrl('/workspace/(dialog:add-workspace/new)');
  }

  editWorkspace($event, workspacesDTO: WorkspaceDTO) {
    if ($event.target.nodeName !== 'I') {
      /* Temporary arrangement for demos: zeppelinURL is defined in index.html*/
      if (typeof(zeppelinURL) !== 'undefined') {
        window.location.href = zeppelinURL +
                                '&workspaceId=' +encodeURIComponent(encodeURIComponent(String(workspacesDTO.workspace.id))) +
                                '&workspaceName=' +encodeURIComponent(encodeURIComponent(String(workspacesDTO.workspace.name)));
        return;
      } else {
        this.router.navigate(['/workspace/' + workspacesDTO.workspace.name + '/assets']);
      }
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
    this.workspaceChanged = this.workspaceService.dataChanged$.subscribe(() => {
      this.getWorkspaces();
    });
    this.workspaceService.dataChanged.next();
  }

  ngOnDestroy() {
    if (this.workspaceChanged && !this.workspaceChanged.closed) {
      this.workspaceChanged.unsubscribe();
    }
  }
}
