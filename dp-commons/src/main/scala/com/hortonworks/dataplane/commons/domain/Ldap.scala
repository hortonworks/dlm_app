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
