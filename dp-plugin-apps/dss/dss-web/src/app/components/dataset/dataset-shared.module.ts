/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {DsAssetSearchV2} from "./views/ds-asset-search-v2/ds-asset-search.component";
import {AdvanceQueryEditor} from "./views/ds-asset-search/queryEditors/advance/advance-query-editor.component";
import {QueryFilter} from "./views/ds-asset-search/queryEditors/advance/filter/filter.component";
import {BasicQueryEditor} from "./views/ds-asset-search/queryEditors/basic/basic-query-editor.component";
import {SearchWidget} from "./views/ds-asset-search/queryEditors/basic/search-widget/search-widget.component";
import {DsAssetList} from "./views/ds-assets-list/ds-assets-list.component";
import {DsAssetListStyle1} from "./views/ds-assets-list/styled/style1";
import {DsAssetsHolder} from "./views/ds-editor/ds-assets-holder/ds-assets-holder.component";
import {DsEditor} from "./views/ds-editor/ds-editor.component";
import {DsCreator} from "./views/ds-create/ds-creator.component";
import {DsInfoHolder} from "./views/ds-editor/ds-info-holder/ds-info-holder.component";
import {UniqueDatasetNameValidator} from "./directives/validators";
import {DsSummaryHolder} from "./views/ds-editor/ds-summary-holder/ds-summary-holder.component";
import {DsFullView} from "./views/ds-full-view/ds-full-view.component";
import {TranslateModule} from "@ngx-translate/core";
import { MyDateRangePickerModule } from 'mydaterangepicker';

import {AssetViewComponent} from './views/asset-view/asset-view.component';
import {NodeDetailsComponent} from './views/asset-view/node-details/node-details.component';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {TabsModule} from '../../shared/tabs/tabs.module';
import { AssetDetailsViewComponent } from './views/asset-view/asset-details-view/asset-details-view.component';
import { AssetColumnVisualComponent } from './views/asset-view/asset-column-visual/asset-column-visual.component';
import { AssetAuditView } from './views/asset-view/asset-audit-view/asset-audit-view.component';
import { AssetPolicyView } from './views/asset-view/asset-policy-view/asset-policy-view.component';
import {LineageModule} from '../../shared/lineage/lineage.module';
import {AssetService} from '../../services/asset.service';
import {RangerService} from '../../services/ranger.service';
import { AuditVisualizationComponent } from './views/asset-view/asset-audit-view/audit-visualization/audit-visualization.component';
import { AssetTagPolicyViewComponent } from './views/asset-view/asset-policy-view/asset-tag-policy-view/asset-tag-policy-view.component';
import { AssetResourcePolicyViewComponent } from './views/asset-view/asset-policy-view/asset-resource-policy-view/asset-resource-policy-view.component';
import {RouterModule} from "@angular/router";
import {routes} from "./dataset.routes";
import {CommentsModule} from '../../shared/comments/comments.module';
import {DatasetTagService} from "app/services/tag.service";
import {DataSetService} from '../../services/dataset.service';
import {LakeService} from '../../services/lake.service';
import {CommentService} from '../../services/comment.service';
import {RatingService} from "../../services/rating.service";
import {FavouriteService} from "../../services/favourite.service";
import {BookmarkService} from "../../services/bookmark.service";

@NgModule({
  declarations: [
    NavTagPanel,
    DsNavResultViewer,
    DsTileProxy,
    DsFullView,
    DsEditor,
    DsCreator,
    DsInfoHolder,
    DsAssetsHolder,
    DsSummaryHolder,
    DsAssetList,
    DsAssetListStyle1,
    DsRowProxy,
    DatasetDashboardComponent,
    DsAssetSearchV2,
    DsAssetSearch,
    BasicQueryEditor,
    AdvanceQueryEditor,
    QueryFilter,
    SearchWidget,
    UniqueDatasetNameValidator,
    AssetViewComponent,
    AssetDetailsViewComponent,
    NodeDetailsComponent,
    AssetColumnVisualComponent,
    AssetAuditView,
    AssetPolicyView,
    AuditVisualizationComponent,
    AssetTagPolicyViewComponent,
    AssetResourcePolicyViewComponent,
  ],
  entryComponents: [QueryFilter],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NguiAutoCompleteModule,
    TaggingWidgetModule,
    TranslateModule,
    PaginationModule,
    DropdownModule,
    TabsModule,
    LineageModule,
    RouterModule.forChild(routes),
    MyDateRangePickerModule,
    CommentsModule
  ],
  exports: [
    NavTagPanel,
    DsNavResultViewer,
    DsTileProxy,
    DsFullView,
    DsEditor,
    DsCreator,
    DsInfoHolder,
    DsAssetsHolder,
    DsSummaryHolder,
    DsAssetList,
    DsRowProxy,
    DatasetDashboardComponent,
    DsAssetSearchV2,
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
    AssetOwnerService,
    AssetService,
    RangerService,
    DatasetTagService,
    DataSetService,
    LakeService,
    CommentService,
    RatingService,
    FavouriteService,
    BookmarkService
  ]
})
export class DatasetSharedModule {
}
