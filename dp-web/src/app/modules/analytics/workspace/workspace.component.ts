import { Component, OnInit } from '@angular/core';
import {WorkspaceService} from '../../../services/workspace.service';
import {Workspace} from '../../../models/workspace';
import {TabStyleType} from '../../../shared/tabs/tabs.component';

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
  workspaces: Workspace[] = [];
  tabType = TabStyleType;

  tabImages = {'TABLE': 'fa-list-ul', 'GRID': 'fa-th'};

  constructor(private workspaceService: WorkspaceService) { }

  ngOnInit() {
    this.workspaceService.list().subscribe((data) => {
      this.workspaces = data;
    });
  }
}
