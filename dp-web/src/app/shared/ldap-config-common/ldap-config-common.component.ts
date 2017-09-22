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

import {Component, OnInit, ViewChild} from '@angular/core';
import {LDAPProperties} from "../../models/ldap-properties";
import {NgForm} from "@angular/forms";
import {ConfigurationService} from "../../services/configuration.service";
import {Loader} from "../utils/loader";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'dp-ldap-config-common',
  templateUrl: './ldap-config-common.component.html',
  styleUrls: ['./ldap-config-common.component.scss']
})
export class LdapConfigCommonComponent implements OnInit {

  showKnoxPassword = false;
  showLdapPassword = false;
  showNotification = false;
  notificationMessages: string[] = [];
  ldapProperties: LDAPProperties = new LDAPProperties();
  isInEditMode: boolean = false;

  @ViewChild('configForm') configForm: NgForm;

  constructor(public configurationService: ConfigurationService, public translateService: TranslateService) {
  }

  ngOnInit() {
    Loader.show();
    this.configurationService.getLdapConfiguration().subscribe(ldapConfig => {
      this.ldapProperties = ldapConfig;
      Loader.hide();
    }, error => {
      Loader.hide();
    });
    let currentLocation = window.location.href.split('/');
    let domain = currentLocation[2].indexOf(':') > -1 ? currentLocation[2].substring(0, currentLocation[2].indexOf(':')) : currentLocation[2];
    if(!this.ldapProperties.domains.find(dm => dm === domain)){
      this.ldapProperties.domains.push(domain);
    }
  }

  save(){
    this.notificationMessages = [];
    if (!this.configForm.form.valid) {
      this.translateService.get('common.defaultRequiredFields').subscribe(msg => this.notificationMessages.push(msg));
      this.showNotification = true;
      return;
    }
    Loader.show();
  }
  closeNotification() {
    this.showNotification = false;
  }

}
