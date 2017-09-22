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
import {LdapConfigCommonComponent} from "../../../../shared/ldap-config-common/ldap-config-common.component";
import {ConfigurationService} from "../../../../services/configuration.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {Loader} from "../../../../shared/utils/loader";
import {LDAPUpdateProperties} from "../../../../models/ldap-properties";

@Component({
  selector: 'dp-ldap-edit-config',
  templateUrl: '../../../../shared/ldap-config-common/ldap-config-common.component.html',
  styleUrls: ['../../../../shared/ldap-config-common/ldap-config-common.component.scss']
})
export class LdapEditConfigComponent extends LdapConfigCommonComponent {

  ldapUpdateProperties: LDAPUpdateProperties = new LDAPUpdateProperties();

  constructor(public configurationService: ConfigurationService,
              private router: Router,
              private route: ActivatedRoute,
              private translateService: TranslateService) {
    super(configurationService);
  }

  ngOnInit(){
    super.ngOnInit();
    this.isInEditMode = true;
  }

  save() {
    this.notificationMessages = [];
    if (!this.configForm.form.valid) {
      this.translateService.get('common.defaultRequiredFields').subscribe(msg => this.notificationMessages.push(msg));
      this.showNotification = true;
      return;
    }
    Loader.show();
    this.ldapUpdateProperties.id = this.ldapProperties.id;
    this.ldapUpdateProperties.bindDn = this.ldapProperties.bindDn;
    this.ldapUpdateProperties.ldapUrl = this.ldapProperties.ldapUrl;
    this.ldapUpdateProperties.password = this.ldapProperties.password;
    this.configurationService.updateLDAP(this.ldapUpdateProperties).subscribe(() => {
      this.router.navigate(['infra/usermgmt/users', {
        status: 'success',
      }]);
      Loader.hide();
    }, (response) => {
      Loader.hide();
      this.showNotification = true;
      if (!response || !response._body) {
        this.notificationMessages.push('Error occurred while saving the configurations.')
      } else {
        JSON.parse(response._body).forEach(error => {
          this.notificationMessages.push(error.message);
        });
      }
    });
  }

}
