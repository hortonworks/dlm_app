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

import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import {DpTableDirective} from './dp-table/dp-table.directive';
import {RedirectUrlComponent} from './redirect-url/redirect-url.component';
import { LdapConfigCommonComponent } from './ldap-config-common/ldap-config-common.component';
import {TranslateModule} from "@ngx-translate/core";
import {RouterModule} from "@angular/router";
import { CommentsComponent } from './comments/comments.component';
import {StarRatingModule} from "angular-star-rating";

@NgModule({
  imports:  [
    CommonModule,
    TranslateModule,
    FormsModule,
    RouterModule,
    StarRatingModule.forRoot()
  ],
  declarations: [DpTableDirective, RedirectUrlComponent, LdapConfigCommonComponent, CommentsComponent],
  exports:  [
    CommonModule,
    FormsModule,
    DpTableDirective,
    RedirectUrlComponent,
  ]
})
export class SharedModule { }
