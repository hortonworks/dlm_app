package models

case class Credential(id: String, password: String)

object JsonFormats {

  import play.api.libs.json.Json

  implicit val credentialFormat = Json.format[Credential]

}


