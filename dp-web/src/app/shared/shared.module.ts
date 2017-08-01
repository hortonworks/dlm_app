import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import {DpTableDirective} from './dp-table/dp-table.directive';
import {RedirectUrlComponent} from './redirect-url/redirect-url.component';

@NgModule({
  imports:  [
    CommonModule
  ],
  declarations: [DpTableDirective, RedirectUrlComponent],
  exports:  [
    CommonModule,
    FormsModule,
    DpTableDirective,
    RedirectUrlComponent,
  ]
})
export class SharedModule { }
