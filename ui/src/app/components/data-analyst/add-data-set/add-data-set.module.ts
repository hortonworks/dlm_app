import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DataSetService } from '../../../services/data-set.service';
import { AddDataSetComponent } from './add-data-set.component';
import { routing } from './add-data-set.route';
import { DataPlaneSearchModule } from '../../../shared/data-plane-search/data-plane-search.modue';
import { DropDownModule } from '../../../shared/dropdown/dropdown.module';
import { SearchQueryService } from '../../../services/search-query.service';
import { BreadcrumbModule } from '../../../shared/breadcrumb/breadcrumb.module';
import { ChipsBarModule } from '../../../shared/chips-bar/chips-bar.module';
import { NVD3Module } from '../../../shared/nvd3/nvd3.module';

@NgModule({
    imports: [routing, CommonModule, FormsModule, DataPlaneSearchModule, DropDownModule, BreadcrumbModule, ChipsBarModule, NVD3Module],
    exports: [AddDataSetComponent],
    declarations: [AddDataSetComponent],
    providers: [DataSetService, SearchQueryService],
})

export class AddDataSetModule {
}
