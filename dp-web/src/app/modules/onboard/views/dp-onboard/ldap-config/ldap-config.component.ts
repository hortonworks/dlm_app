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

import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {ConfigurationService} from '../../../../../services/configuration.service';
import {TranslateService} from '@ngx-translate/core';
import {Loader} from '../../../../../shared/utils/loader';
import {LdapConfigCommonComponent} from "../../../../../shared/ldap-config-common/ldap-config-common.component";


@Component({
  selector: 'dp-ldap-config',
  templateUrl: '../../../../../shared/ldap-config-common/ldap-config-common.component.html',
  styleUrls: ['../../../../../shared/ldap-config-common/ldap-config-common.component.scss']
})
export class LdapConfigComponent extends LdapConfigCommonComponent {

  constructor(public configurationService: ConfigurationService,
              private router: Router,
              private route: ActivatedRoute,
              public translateService: TranslateService) {
    super(configurationService,translateService);
  }

  save() {
    super.save();
    this.configurationService.configureLDAP(this.ldapProperties).subscribe(() => {
      this.router.navigate(['onboard/adduser']);
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
