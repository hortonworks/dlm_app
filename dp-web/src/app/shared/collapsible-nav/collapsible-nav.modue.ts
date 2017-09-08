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

import {CollapsibleNavComponent}   from './collapsible-nav.component';
import {SharedModule} from '../shared.module';
import {PersonaPopupComponent} from './persona-popup/persona-popup.component';

@NgModule({
  imports: [SharedModule],
  exports: [CollapsibleNavComponent],
  declarations: [PersonaPopupComponent, CollapsibleNavComponent],
  providers: [],
})
export class CollapsibleNavModule {
}
