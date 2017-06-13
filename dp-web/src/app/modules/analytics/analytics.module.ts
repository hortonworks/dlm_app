import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import {SharedModule} from '../../shared/shared.module';
import { WorkspaceComponent } from './workspace/workspace.component';
import {routes} from './analytics.routes';
import {WorkspaceService} from '../../services/workspace.service';
import {TabsModule} from '../../shared/tabs/tabs.module';
import { AddWorkspaceComponent } from './add-workspace/add-workspace.component';
import {ClusterService} from '../../services/cluster.service';
import {SelectModule} from '../../shared/select/select.module';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    SelectModule,
    TabsModule
  ],
  declarations: [
    WorkspaceComponent,
    AddWorkspaceComponent
  ],
  providers: [
    ClusterService,
    WorkspaceService
  ]
})
export class AnalyticsModule { }
