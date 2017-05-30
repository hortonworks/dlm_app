import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import {DpTableDirective} from './dp-table/dp-table.directive';

@NgModule({
  imports:  [
    CommonModule
  ],
  declarations: [DpTableDirective],
  exports:  [
    CommonModule,
    FormsModule,
    DpTableDirective
  ]
})
export class SharedModule { }
