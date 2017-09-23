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
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';

import {routes} from './onboard.routes';
import {NguiAutoCompleteModule} from '@ngui/auto-complete';
import {FirstRunComponent} from './views/first-run/first-run.component';
import {DpOnboardComponent} from './views/dp-onboard/dp-onboard.component';
import {MultiSelect} from '../../shared/multi-select/multi-select.component';
import {LdapConfigComponent} from './views/ldap-config/ldap-config.component';
import {UserAddComponent} from './views/user-add/user-add.component';
import {TaggingWidgetModule} from '../../shared/tagging-widget/tagging-widget.module';
import {StatusCheckGuard} from './guards/status-check-guard';
import {ConfigCheckGuard} from './guards/config-check-guard';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    NguiAutoCompleteModule,
    RouterModule.forChild(routes),
    TaggingWidgetModule,
    TranslateModule
  ],
  declarations: [
    FirstRunComponent,
    MultiSelect,
    DpOnboardComponent,
    LdapConfigComponent,
    UserAddComponent
  ],
  providers: [
    StatusCheckGuard,
    ConfigCheckGuard
  ]
})
export class OnboardModule {
}
