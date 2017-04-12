import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChipsBarComponent }   from './chips-bar.component';

@NgModule({
    imports: [CommonModule, FormsModule],
    exports: [ChipsBarComponent],
    declarations: [ChipsBarComponent],
    providers: [],
})
export class ChipsBarModule {
}
