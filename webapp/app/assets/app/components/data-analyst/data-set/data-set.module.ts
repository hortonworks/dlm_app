import {NgModule} from '@angular/core';
import {DataSetComponent}   from './data-set.component';
import {SharedModule} from '../../../shared/shared.module';
import {routing} from './data-set.route';
import {DataSetService} from '../../../services/data-set.service';
import {DataCenterService} from '../../../services/data-center.service';

@NgModule({
    imports: [routing, SharedModule],
    exports: [DataSetComponent],
    declarations: [DataSetComponent],
    providers: [DataSetService, DataCenterService],
})

export class DataSetModule {
}
