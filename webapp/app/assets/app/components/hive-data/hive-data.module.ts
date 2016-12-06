/**
 * Created by rksv on 04/12/16.
 */
import {NgModule} from '@angular/core';

import {SharedModule} from '../../shared/shared.module';
import {HiveDataComponent} from './hive-data.component';
import {HiveDataService} from '../../services/hive-data.service';

@NgModule({
    imports: [SharedModule],
    exports: [HiveDataComponent],
    declarations: [HiveDataComponent],
    providers: [HiveDataService],
})
export class HiveDataModule {
}
