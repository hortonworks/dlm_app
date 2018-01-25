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
import { RouterModule } from '@angular/router';

import {LineageComponent}   from './lineage.component';
import {AtlasService} from '../../services/atlas.service';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [LineageComponent],
  declarations: [LineageComponent],
  providers: [AtlasService],
})
export class LineageModule {
}