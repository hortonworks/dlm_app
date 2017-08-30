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

package com.hortonworks.dataplane.commons.domain




object Ldap {
  case class LdapUser(name:String,className:String,nameInNameSpace:String,groups: Seq[LdapGroup])
  case class LdapGroup(name:String,className:String,nameInNameSpace:String)
  case class LdapSearchResult(name:String,className:String,nameInNameSpace:String)
  object LdapSearchResult {
    import play.api.libs.json.Json
    implicit val ldapConfigInfoFormat = Json.format[LdapSearchResult]
  }
  object LdapGroup{
    import play.api.libs.json.Json
    implicit val ldapGroupFormat = Json.format[LdapGroup]
  }
  object LdapUser{
    import play.api.libs.json.Json
    implicit val ldapUserFormat = Json.format[LdapUser]
  }
}
