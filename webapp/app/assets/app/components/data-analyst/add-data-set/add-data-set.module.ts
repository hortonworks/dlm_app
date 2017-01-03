import {NgModule} from '@angular/core';
import {SharedModule} from '../../../shared/shared.module';
import {DataSetService} from '../../../services/data-set.service';
import {AddDataSetComponent} from './add-data-set.component';
import {routing} from './add-data-set.route';
import {DataPlaneSearchModule} from '../../../shared/data-plane-search/data-plane-search.modue';
import {DropDownModule} from '../../../shared/dropdown/dropdown.module';
import {SearchQueryService} from '../../../services/search-query.service';
import {BreadcrumbModule} from '../../../shared/breadcrumb/breadcrumb.module';
import {ChipsBarModule} from '../../../shared/chips-bar/chips-bar.module';

@NgModule({
    imports: [routing, SharedModule, DataPlaneSearchModule, DropDownModule, BreadcrumbModule, ChipsBarModule],
    exports: [AddDataSetComponent],
    declarations: [AddDataSetComponent],
    providers: [DataSetService, SearchQueryService],
})

export class AddDataSetModule {
}
