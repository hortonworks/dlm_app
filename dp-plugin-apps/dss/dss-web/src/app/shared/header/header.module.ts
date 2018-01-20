import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './header.component';
import {BreadCrumbModule} from '../bread-crumb/bread-crumb.module';


@NgModule({
  imports: [
    CommonModule,
    BreadCrumbModule
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent]
})
export class HeaderModule { }
