import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DataManagerComponent }   from './data-manager.component';

@NgModule({
    imports: [CommonModule, FormsModule],
    exports: [DataManagerComponent],
    declarations: [DataManagerComponent],
    providers: [],
})
export class DataManagerModule {
}
