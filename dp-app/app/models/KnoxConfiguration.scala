package models

case class KnoxConfiguration(ldapUrl: String,
                             bindDn: Option[String],
                             userDnTemplate: Option[String])
object KnoxConfiguration {

  import play.api.libs.json.Json
  implicit val knoxConfigurationFormat = Json.format[KnoxConfiguration]

}
