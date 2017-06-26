package com.hortonworks.dataplane.commons.domain




object Ldap {
  case class LdapSearchResult(name:String,className:String,nameInNameSpace:String)
  object LdapSearchResult {
    import play.api.libs.json.Json
    implicit val ldapConfigInfoFormat = Json.format[LdapSearchResult]

  }
}
