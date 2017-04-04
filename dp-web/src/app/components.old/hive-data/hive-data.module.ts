import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HiveDataComponent } from './hive-data.component';

import { AtlasService } from '../../services/atlas.service';
import { DataCenterService } from '../../services/data-center.service';

@NgModule({
    imports: [CommonModule, FormsModule],
    exports: [HiveDataComponent],
    declarations: [HiveDataComponent],
    providers: [AtlasService, DataCenterService],
})
export class HiveDataModule {
}
