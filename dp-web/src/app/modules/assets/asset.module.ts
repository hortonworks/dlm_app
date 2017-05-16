import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './asset.routes';
import {AssetViewComponent} from './asset-view/asset-view.component';
import {DropdownModule} from '../../shared/dropdown/dropdown.module';
import {TabsModule} from '../../shared/tabs/tabs.module';
import { AssetDetailsViewComponent } from './asset-view/asset-details-view/asset-details-view.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DropdownModule,
    TabsModule
  ],
  declarations: [
    AssetViewComponent,
    AssetDetailsViewComponent
  ]
})
export class AssetModule { }
