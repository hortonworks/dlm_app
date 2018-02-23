import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetCollectionComponent } from './asset-collection.component';
import {TabsModule} from '../../../../shared/tabs/tabs.module';
import {RichDatasetService} from '../../services/RichDatasetService';
import {TranslateModule} from '@ngx-translate/core';
import { OverviewComponent } from './overview/overview.component';
import {ProfilerService} from '../../../../services/profiler.service';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    TabsModule
  ],
  declarations: [AssetCollectionComponent, OverviewComponent],
  providers: [RichDatasetService, ProfilerService]
})
export class AssetCollectionModule { }
