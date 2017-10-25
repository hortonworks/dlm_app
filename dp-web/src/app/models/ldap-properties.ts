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

export class LDAPProperties {
  id: number;
  ldapUrl: string;
  domains: string[] = [];
  userSearchBase: string;
  userSearchAttributeName: string;
  groupSearchBase:string;
  groupSearchAttributeName: string;
  bindDn :string;
  password: string;
  groupObjectClass: string;
  groupMemberAttributeName: string;

}

export class LDAPUpdateProperties {
  id: number;
  ldapUrl: string;
  bindDn :string;
  password: string;
}
