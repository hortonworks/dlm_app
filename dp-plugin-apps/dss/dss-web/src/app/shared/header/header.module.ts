import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './header.component';
import {BreadCrumbModule} from '../bread-crumb/bread-crumb.module';
import {RouterModule} from '@angular/router';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BreadCrumbModule
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent]
})
export class HeaderModule { }
