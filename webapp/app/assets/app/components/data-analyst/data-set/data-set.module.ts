import {NgModule} from '@angular/core';
import {DataSetComponent}   from './data-set.component';
import {SharedModule} from '../../../shared/shared.module';
import {routing} from './data-set.route';
import {DataSetService} from '../../../services/data-set.service';
import {DataCenterService} from '../../../services/data-center.service';
import {SearchQueryService} from '../../../services/search-query.service';
import {NVD3Module} from '../../../shared/nvd3/nvd3.module';


@NgModule({
    imports: [routing, SharedModule, NVD3Module],
    exports: [DataSetComponent],
    declarations: [DataSetComponent],
    providers: [DataSetService, DataCenterService, SearchQueryService],
})

export class DataSetModule {
}
