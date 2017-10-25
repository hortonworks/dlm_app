/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {NgModule} from '@angular/core';
import {RouterModule} from "@angular/router";

import {HeaderComponent}   from './header.component';
import {SharedModule} from '../../shared/shared.module';
import {BreadCrumbModule} from '../../shared/bread-crumb/bread-crumb.module';

@NgModule({
  imports: [SharedModule, BreadCrumbModule, RouterModule],
  exports: [HeaderComponent],
  declarations: [HeaderComponent],
  providers: [],
})
export class HeaderModule {
}
