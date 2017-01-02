import {NgModule} from '@angular/core';
import {ViewDataComponent}   from './view-data.component';
import {SharedModule} from '../../shared/shared.module';
import {routing} from './view-data.routing';
import {BreadcrumbModule} from '../../shared/breadcrumb/breadcrumb.module';
import {LoaderSpinModule} from '../../shared/loader-spin/loader-spin.module';
import {HiveDataModule} from '../hive-data/hive-data.module';
import {AtlasLineageModule} from '../atlas-lineage/atlas-lineage.module';
import {RangerPoliciesModule} from '../ranger-policies/ranger-policies.module';
import {DataPlaneSearchModule} from '../../shared/data-plane-search/data-plane-search.modue';
import {SearchQueryService} from '../../services/search-query.service';

@NgModule({
    imports: [routing, SharedModule, BreadcrumbModule, HiveDataModule, AtlasLineageModule, RangerPoliciesModule, DataPlaneSearchModule, LoaderSpinModule],
    exports: [],
    declarations: [ViewDataComponent],
    providers: [SearchQueryService],
})
export class ViewDataModule {
}
