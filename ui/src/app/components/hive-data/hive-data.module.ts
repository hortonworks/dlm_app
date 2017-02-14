import {NgModule} from '@angular/core';

import {SharedModule} from '../../shared/shared.module';
import {HiveDataComponent} from './hive-data.component';

import {AtlasService} from '../../services/atlas.service';
import {DataCenterService} from '../../services/data-center.service';

@NgModule({
    imports: [SharedModule],
    exports: [HiveDataComponent],
    declarations: [HiveDataComponent],
    providers: [AtlasService, DataCenterService],
})
export class HiveDataModule {
}
