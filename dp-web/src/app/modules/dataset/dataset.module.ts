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
import {DsFullView} from "./views/ds-full-view/ds-full-view.component";
import {DsAssetList} from "./views/ds-assets-list/ds-assets-list.component";
import {DsAssetsService} from "./services/dsAssetsService";

import {DsRowProxy} from "./views/dashboard/ds-nav-result-viewer/row-proxy/row-proxy.component";

import {DsEditor} from "./views/ds-editor/ds-editor.component";
import {DsInfoHolder} from "./views/ds-editor/ds-info-holder/ds-info-holder.component";
import {DsAssetsHolder} from "./views/ds-editor/ds-assets-holder/ds-assets-holder.component";

import {PaginationComponent} from "../../widgets/pagination/pagination.component";
import {DsSummaryHolder} from "./views/ds-editor/ds-summary-holder/ds-summary-holder.component";
import {TaggingWidget} from "../../shared/tagging-widget/tagging-widget.component";
import {DsTagsService} from "./services/dsTagsService";
import {DsAssetSearch} from "./views/ds-asset-search/ds-assest-search.component";
import {NormalQueryEditor} from "./views/ds-asset-search/queryEditors/normal/normal-query-editor.component";
import {SearchWidget} from "./views/ds-asset-search/queryEditors/normal/search-widget/search-widget.component";
import {TaggingWidgetModule} from "../../shared/tagging-widget/tagging-widget.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    TaggingWidgetModule
  ],
  declarations: [
      NavTagPanel,
      DsNavResultViewer,
      DsTileProxy,
      DsFullView,
      DsEditor,
      DsInfoHolder,
      DsAssetsHolder,
      DsSummaryHolder,
      DsAssetList,
      DsRowProxy,
      DatasetDashboardComponent,
      PaginationComponent,
      DsAssetSearch,
      NormalQueryEditor,
      SearchWidget
  ],
  providers: [
    RichDatasetService,
    DsAssetsService,
    DsTagsService
  ]
})
export class DatasetModule { }
