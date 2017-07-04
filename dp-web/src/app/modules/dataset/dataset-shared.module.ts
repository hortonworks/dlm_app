import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {NguiAutoCompleteModule} from '@ngui/auto-complete';
import {PaginationModule} from "../../shared/pagination/pagination.module";
import {TaggingWidgetModule} from "../../shared/tagging-widget/tagging-widget.module";
import {AssetOwnerService} from "./services/assetOwnerService";
import {DsAssetsService} from "./services/dsAssetsService";
import {DsTagsService} from "./services/dsTagsService";
import {RichDatasetService} from "./services/RichDatasetService";
import {DatasetDashboardComponent} from "./views/dashboard/dataset-dashboard.component";
import {DsNavResultViewer} from "./views/dashboard/ds-result-viewer/ds-result-viewer.component";
import {DsRowProxy} from "./views/dashboard/ds-result-viewer/row-proxy/row-proxy.component";
import {DsTileProxy} from "./views/dashboard/ds-result-viewer/tile-proxy/tile-proxy.component";
import {NavTagPanel} from "./views/dashboard/nav-tag-panel/nav-tag-panel.component";
import {DsAssetSearch} from "./views/ds-asset-search/ds-asset-search.component";
import {AdvanceQueryEditor} from "./views/ds-asset-search/queryEditors/advance/advance-query-editor.component";
import {QueryFilter} from "./views/ds-asset-search/queryEditors/advance/filter/filter.component";
import {BasicQueryEditor} from "./views/ds-asset-search/queryEditors/basic/basic-query-editor.component";
import {SearchWidget} from "./views/ds-asset-search/queryEditors/basic/search-widget/search-widget.component";
import {DsAssetList} from "./views/ds-assets-list/ds-assets-list.component";
import {DsAssetsHolder} from "./views/ds-editor/ds-assets-holder/ds-assets-holder.component";
import {DsEditor} from "./views/ds-editor/ds-editor.component";
import {DsInfoHolder} from "./views/ds-editor/ds-info-holder/ds-info-holder.component";
import {DsSummaryHolder} from "./views/ds-editor/ds-summary-holder/ds-summary-holder.component";
import {DsFullView} from "./views/ds-full-view/ds-full-view.component";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
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
    DsAssetSearch,
    BasicQueryEditor,
    AdvanceQueryEditor,
    QueryFilter,
    SearchWidget
  ],
  entryComponents: [QueryFilter],
  imports: [
    CommonModule,
    FormsModule,
    NguiAutoCompleteModule,
    TaggingWidgetModule,
    TranslateModule,
    PaginationModule
  ],
  exports: [
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
  ]
})
export class DatasetSharedModule {
}
