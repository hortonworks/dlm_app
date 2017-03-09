import { NgModule } from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';

import { DataPlaneSearchComponent }   from './data-plane-search.component';
import { DropDownModule } from '../dropdown/dropdown.module';

@NgModule({
    imports: [CommonModule, FormsModule, DropDownModule],
    exports: [DataPlaneSearchComponent],
    declarations: [DataPlaneSearchComponent],
    providers: [],
})
export class DataPlaneSearchModule {
}
