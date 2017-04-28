import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './dataset.routes';
import {DatasetDashboardComponent} from "./views/dashboard/dataset-dashboard.component";
import {NavTagPanel} from "./views/dashboard/nav-tag-panel/nav-tag-panel.component";
import {DsNavResultViewer} from "./views/dashboard/ds-nav-result-viewer/ds-nav-result-viewer.component";
import {RichDatasetService} from "./services/RichDatasetService";
import {DsTileProxy} from "./views/dashboard/ds-nav-result-viewer/tile-proxy/tile-proxy.component";


@NgModule({
  imports: [
    CommonModule,

    RouterModule.forChild(routes),
  ],
  declarations: [
      NavTagPanel,
      DsNavResultViewer,
      DsTileProxy,
      DatasetDashboardComponent
  ],
  providers: [
    RichDatasetService
  ]
})
export class DatasetModule { }
