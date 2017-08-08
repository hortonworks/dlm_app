package models

case class KnoxConfiguration(ldapUrl: String,
                             bindDn: Option[String],
                             userDnTemplate: Option[String],
                             domains: Option[Seq[String]])
object KnoxConfiguration {

  import play.api.libs.json.Json
  implicit val knoxConfigurationWrites = Json.writes[models.KnoxConfiguration]
  implicit val knoxConfigurationReads = Json.reads[models.KnoxConfiguration]

}
