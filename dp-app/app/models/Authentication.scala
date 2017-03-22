package models

case class Credential(username: String, password: String)

object JsonFormats {

  import play.api.libs.json.Json

  implicit val credentialFormat = Json.format[Credential]

}


