import {NgModule} from '@angular/core';
import {ViewDataComponent}   from './view-data.component';
import {SharedModule} from '../../shared/shared.module';
import {routing} from './view-data.routing';
import {BreadcrumbModule} from '../../shared/breadcrumb/breadcrumb.module';
import {HiveDataModule} from '../hive-data/hive-data.module';
import {AtlasLineageModule} from '../atlas-lineage/atlas-lineage.module';
import {RangerPoliciesModule} from '../ranger-policies/ranger-policies.module';

@NgModule({
    imports: [routing, SharedModule, BreadcrumbModule, HiveDataModule, AtlasLineageModule, RangerPoliciesModule],
    exports: [],
    declarations: [ViewDataComponent],
    providers: [],
})
export class ViewDataModule {
}
