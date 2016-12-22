import {NgModule} from '@angular/core';
import {SharedModule} from '../../../shared/shared.module';
import {DataSetService} from '../../../services/data-set.service';
import {AddDataSetComponent} from './add-data-set.component';
import {routing} from './add-data-set.route';
import {DataPlaneSearchModule} from '../../../shared/data-plane-search/data-plane-search.modue';

@NgModule({
    imports: [routing, SharedModule, DataPlaneSearchModule],
    exports: [AddDataSetComponent],
    declarations: [AddDataSetComponent],
    providers: [DataSetService],
})

export class AddDataSetModule {
}
