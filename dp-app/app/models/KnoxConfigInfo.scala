package models

case class KnoxConfigInfo(
    id: Option[Long],
    ldapUrl: String,
    userDnTemplate: Option[String],
    userSearchBase: Option[String],
    userSearchAttributeName:Option[String],
    groupSearchBase: Option[String],
    groupSearchAttributeName:Option[String],
    bindDn :Option[String],
    password: Option[String],
    domains: Option[Seq[String]],/*list of urls from which app is accessible*/
    signedTokenTtl : Option[Long], /* None will make it -1 and valid forever. Give this in minutes*/
    allowHttpsOnly : Option[Boolean]=Some(false) /* the app has to be on https for more security*/
)
object KnoxConfigInfo {

  import play.api.libs.json.Json
  implicit val knoxConfigInfoFormat = Json.format[KnoxConfigInfo]

}
