package com.hortonworks.dataplane.knoxagent

case class KnoxConfig(
    ldapUrl: Option[String] = None,
    bindDn: Option[String] = None,
    userDnTemplate: Option[String] = None,
    //domains: Option[String],/*list of urls from which app is accessible*/
    domains: Option[Seq[String]],/*list of urls from which app is accessible*/
    signedTokenTtl : Option[Long], /* None will make it -1 and valid forever. Give this in minutes*/
    allowHttpsOnly : Option[Boolean]=Some(false) /* the app has to be on https for more security*/
)
object KnoxConfig {

  import play.api.libs.json.Json
  implicit val knoxConfigFormat = Json.format[KnoxConfig]

}
