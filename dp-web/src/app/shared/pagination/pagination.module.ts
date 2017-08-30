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

import {SharedModule} from '../shared.module';
import {SimplePaginationWidget} from './pagination.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [SimplePaginationWidget],
  exports: [SimplePaginationWidget],
  imports: [SharedModule, TranslateModule],
  providers: [],
})
export class PaginationModule {
}
