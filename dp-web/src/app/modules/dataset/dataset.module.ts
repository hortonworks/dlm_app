import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './dataset.routes';
import {DatasetDashboardComponent} from "./views/dashboard/dataset-dashboard.component";
import {NavTagPanel} from "./views/dashboard/nav-tag-panel/nav-tag-panel.component";
import {DsNavResultViewer} from "./views/dashboard/ds-result-viewer/ds-result-viewer.component";
import {RichDatasetService} from "./services/RichDatasetService";
import {DsTileProxy} from "./views/dashboard/ds-result-viewer/tile-proxy/tile-proxy.component";
import {DsFullView} from "./views/ds-full-view/ds-full-view.component";
import {DsAssetList} from "./views/ds-assets-list/ds-assets-list.component";
import {DsAssetsService} from "./services/dsAssetsService";

import {DsRowProxy} from "./views/dashboard/ds-result-viewer/row-proxy/row-proxy.component";

import {DsEditor} from "./views/ds-editor/ds-editor.component";
import {DsInfoHolder} from "./views/ds-editor/ds-info-holder/ds-info-holder.component";
import {DsAssetsHolder} from "./views/ds-editor/ds-assets-holder/ds-assets-holder.component";

import {DsSummaryHolder} from "./views/ds-editor/ds-summary-holder/ds-summary-holder.component";
import {TaggingWidget} from "../../shared/tagging-widget/tagging-widget.component";
import {DsTagsService} from "./services/dsTagsService";
import {DsAssetSearch} from "./views/ds-asset-search/ds-asset-search.component";
import {BasicQueryEditor} from "./views/ds-asset-search/queryEditors/basic/basic-query-editor.component";
import {SearchWidget} from "./views/ds-asset-search/queryEditors/basic/search-widget/search-widget.component";
import {AdvanceQueryEditor} from "./views/ds-asset-search/queryEditors/advance/advance-query-editor.component";
import {AssetOwnerService} from "./services/assetOwnerService";
import {QueryFilter} from "./views/ds-asset-search/queryEditors/advance/filter/filter.component";
import {SimplePaginationWidget} from "../../shared/pagination/pagination.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
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
      SimplePaginationWidget,
      TaggingWidget,
      DsAssetSearch,
      BasicQueryEditor,
      AdvanceQueryEditor,
      QueryFilter,
      SearchWidget
  ],
  providers: [
    RichDatasetService,
    DsAssetsService,
    DsTagsService,
    AssetOwnerService
  ],
  entryComponents: [QueryFilter]
})
export class DatasetModule { }
