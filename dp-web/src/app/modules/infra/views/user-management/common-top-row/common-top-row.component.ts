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

import { Component, OnInit } from '@angular/core';
import {ConfigurationService} from "../../../../../services/configuration.service";
import {LDAPProperties} from "../../../../../models/ldap-properties";
import {Loader} from "../../../../../shared/utils/loader";
import {Router} from "@angular/router";

@Component({
  selector: 'dp-common-top-row',
  templateUrl: './common-top-row.component.html',
  styleUrls: ['./common-top-row.component.scss']
})
export class CommonTopRowComponent implements OnInit {

  ldapProperties: LDAPProperties = new LDAPProperties();
  constructor(private router: Router,private configurationService: ConfigurationService) { }

  ngOnInit() {
    this.getLdapPrpoperties();
  }
  getLdapPrpoperties(){
    Loader.show();
    this.configurationService.getLdapConfiguration().subscribe(ldapConfig => {
      this.ldapProperties = ldapConfig;
      Loader.hide();
    }, error => {
      Loader.hide();
    });
  }

}
