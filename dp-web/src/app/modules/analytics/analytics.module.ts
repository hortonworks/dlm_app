import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {TranslateModule} from "@ngx-translate/core";

import {SharedModule} from '../../shared/shared.module';
import { WorkspaceComponent } from './workspace/workspace.component';
import {analyticsRoutes} from './analytics.routes';
import {WorkspaceService} from '../../services/workspace.service';
import {TabsModule} from '../../shared/tabs/tabs.module';
import { AddWorkspaceComponent } from './workspace/add-workspace/add-workspace.component';
import {ClusterService} from '../../services/cluster.service';
import {SelectModule} from '../../shared/select/select.module';
import { AssetsComponent } from './workspace/assets/assets.component';
import {DatasetSharedModule} from '../dataset/dataset-shared.module';
import {WorkspaceAssetsService} from '../../services/workspace-assets.service';
import {DsAssetsService} from '../dataset/services/dsAssetsService';

@NgModule({
  imports: [
    RouterModule.forChild(analyticsRoutes),
    DatasetSharedModule,
    CommonModule,
    SharedModule,
    SelectModule,
    TabsModule,
    TranslateModule
  ],
  declarations: [
    AddWorkspaceComponent,
    AssetsComponent,
    WorkspaceComponent
  ],
  providers: [
    DsAssetsService,
    ClusterService,
    WorkspaceService,
    WorkspaceAssetsService
  ]
})
export class AnalyticsModule { }
