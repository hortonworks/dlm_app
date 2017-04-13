package models

import com.hortonworks.dataplane.commons.domain.Entities.Errors
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

case class WrappedErrorsException(errors: Errors) extends Exception

object JsonFormatters {

  import play.api.libs.json.Json

  implicit val WrappedErrorsExceptionFormat = Json.format[WrappedErrorsException]

}
