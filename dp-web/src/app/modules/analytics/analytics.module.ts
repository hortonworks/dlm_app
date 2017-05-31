import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import {SharedModule} from '../../shared/shared.module';
import { WorkspaceComponent } from './workspace/workspace.component';
import {routes} from './analytics.routes';
import {WorkspaceService} from '../../services/workspace.service';
import {TabsModule} from '../../shared/tabs/tabs.module';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    TabsModule
  ],
  declarations: [
    WorkspaceComponent
  ],
  providers: [
    WorkspaceService
  ]
})
export class AnalyticsModule { }
