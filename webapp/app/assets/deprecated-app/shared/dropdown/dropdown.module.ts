/**
 * Created by rksv on 03/12/16.
 */
import {NgModule} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {CommonModule } from '@angular/common';
import {DropDownComponent}   from './dropdown.component';

@NgModule({
    imports: [FormsModule, CommonModule],
    exports: [DropDownComponent],
    declarations: [DropDownComponent]
})
export class DropDownModule {
}
