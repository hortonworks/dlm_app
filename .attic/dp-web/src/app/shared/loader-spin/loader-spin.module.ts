import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderSpinComponent }   from './loader-spin.component';

@NgModule({
    imports: [FormsModule, CommonModule],
    exports: [LoaderSpinComponent],
    declarations: [LoaderSpinComponent]
})
export class LoaderSpinModule {
}
