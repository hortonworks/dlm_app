import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ViewDataComponent }   from './view-data.component';
import { routing } from './view-data.routing';
import { BreadcrumbModule } from '../../shared/breadcrumb/breadcrumb.module';
import { LoaderSpinModule } from '../../shared/loader-spin/loader-spin.module';
import { HiveDataModule } from '../hive-data/hive-data.module';
import { AtlasLineageModule } from '../atlas-lineage/atlas-lineage.module';
import { RangerPoliciesModule } from '../ranger-policies/ranger-policies.module';
import { DataPlaneSearchModule } from '../../shared/data-plane-search/data-plane-search.modue';
import { SearchQueryService } from '../../services/search-query.service';
import { AtlasService } from '../../services/atlas.service';

@NgModule({
    imports: [routing, CommonModule, FormsModule, BreadcrumbModule, HiveDataModule, AtlasLineageModule, RangerPoliciesModule, DataPlaneSearchModule, LoaderSpinModule],
    exports: [],
    declarations: [ViewDataComponent],
    providers: [SearchQueryService, AtlasService],
})
export class ViewDataModule {
}
