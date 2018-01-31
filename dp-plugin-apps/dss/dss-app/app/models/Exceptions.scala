/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package models

import com.hortonworks.dataplane.commons.domain.Entities.Errors
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import play.api.http.Status
import play.api.libs.json.{JsValue, Json}

case class WrappedErrorsException(errors: Errors) extends Exception

abstract class ApplicationException
  extends Exception {

  val code: Long
  val message: String
  val http: Int = Status.INTERNAL_SERVER_ERROR

//  def apply(): ApplicationException = apply(Map[String, String]())

  def toJs(): JsValue = Json.obj("code" -> code, "message" -> message)
}

case class UnsupportedInputException(val code: Long, val message: String, override val http: Int = Status.BAD_REQUEST) extends ApplicationException

object JsonFormatters {

  import play.api.libs.json.Json

  implicit val WrappedErrorsExceptionFormat = Json.format[WrappedErrorsException]

}
