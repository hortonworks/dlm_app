package models

case class KnoxConfigInfo(
    id: Option[Long],
    masterPasword: Option[String],
    ldapUrl: String,
    userDnTemplate: Option[String],
    userSearchBase: Option[String],
    groupSearchBase: Option[String],
    bindDn :Option[String],
    password: Option[String]
)
object KnoxConfigInfo {

  import play.api.libs.json.Json
  implicit val knoxConfigInfoFormat = Json.format[KnoxConfigInfo]

}
