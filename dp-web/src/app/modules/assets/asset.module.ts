import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {FormsModule} from "@angular/forms";

import { routes } from './asset.routes';
import {AssetViewComponent} from './asset-view/asset-view.component';
import {NodeDetailsComponent} from './asset-view/node-details/node-details.component';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {TabsModule} from '../../shared/tabs/tabs.module';
import { AssetDetailsViewComponent } from './asset-view/asset-details-view/asset-details-view.component';
import { AssetColumnVisualComponent } from './asset-view/asset-column-visual/asset-column-visual.component';
import { AssetAuditView } from './asset-view/asset-audit-view/asset-audit-view.component';
import { AssetPolicyView } from './asset-view/asset-policy-view/asset-policy-view.component';
import {LineageModule} from '../../shared/lineage/lineage.module';
import {AssetService} from '../../services/asset.service';
import {RangerService} from '../../services/ranger.service';
import {PaginationModule} from "../../shared/pagination/pagination.module";

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    DropdownModule,
    TabsModule,
    LineageModule,
    PaginationModule
  ],
  declarations: [
    AssetViewComponent,
    AssetDetailsViewComponent,
    NodeDetailsComponent,
    AssetColumnVisualComponent,
    AssetAuditView,
    AssetPolicyView
  ],
  providers: [
    AssetService,
    RangerService
  ]
})
export class AssetModule { }
