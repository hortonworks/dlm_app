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

import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TabStyleType} from '../tabs/tabs.component';
import {LDAPProperties} from '../../models/ldap-properties';
import {ConfigurationService} from '../../services/configuration.service';

@Component({
  selector: 'dp-ldap-connectivity-check',
  templateUrl: './ldap-connectivity-check.component.html',
  styleUrls: ['./ldap-connectivity-check.component.scss']
})
export class LdapConnectivityCheckComponent implements OnInit, OnChanges {

  @Input('ldapProperties') ldapProperties: LDAPProperties;
  @Input('enable') enable = false;

  tabType = TabStyleType;

  activeTabName: string;
  tabNames = ['CONNECTION', 'USER', 'GROUP'];
  connecting = true;
  connected = false;
  connectionFailed = false;
  userName: string;
  groupName: string;
  userValidationInProgress = false;
  groupValidationInProgress = false;

  constructor(private configurationService: ConfigurationService) {
  }

  ngOnInit() {
    this.activeTabName = this.tabNames[0];

    setTimeout(() => {
      this.connecting = false;
      this.connected = false;
      this.connectionFailed = true;
    }, 5000)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['enable']) {
      if (this.enable) {
        this.checkConnectivity();
      }
    }
  }

  onTabSelect(tab) {
    this.activeTabName = tab;
  }

  checkConnectivity() {
    this.connecting = true;
    this.configurationService.checkLdapConnectivity(this.ldapProperties).subscribe(result => {
      this.connected = result
    }, error => {
      this.connectionFailed = true;
    });
  }

  checkUser() {

  }

  checkGroup() {

  }
}
