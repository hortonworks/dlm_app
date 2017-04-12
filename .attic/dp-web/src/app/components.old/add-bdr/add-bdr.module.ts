import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AddBdrComponent }   from './add-bdr.component';
import { BeaconsComponent }   from './beacons.component';
import { routing } from './add-bdr.routing';
import { DropDownModule } from '../../shared/dropdown/dropdown.module';
import { DataPlaneSearchModule } from '../../shared/data-plane-search/data-plane-search.modue';
import { SearchQueryService } from '../../services/search-query.service';

@NgModule({
    imports: [routing, CommonModule, FormsModule, DropDownModule, DataPlaneSearchModule],
    exports: [AddBdrComponent, BeaconsComponent],
    declarations: [AddBdrComponent, BeaconsComponent],
    providers: [SearchQueryService],
})
export class AddBdrModule {
}
