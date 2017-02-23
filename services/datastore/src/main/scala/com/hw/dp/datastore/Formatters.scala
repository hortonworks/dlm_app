package com.hw.dp.datastore

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import com.hw.dp.db.DBResult
import com.wix.accord.Failure
import com.wix.accord.dsl._
import org.apache.commons.lang3.exception.ExceptionUtils
import spray.json.DefaultJsonProtocol



trait RequestResponseFormatters extends SprayJsonSupport with DefaultJsonProtocol {
  implicit val collectionNameValidator = validator[Collection] { request =>
    request.name is notEmpty
    request.name.length() as "name:length" should be >= 5
  }

  implicit val collectionNameFormat = jsonFormat1(Collection)
  implicit val emptyResponseFormat = jsonFormat1(OkResponse)
  implicit val ApiErrorResponseFormat = jsonFormat2(ApiError)
  implicit val ErrorResponseResponseFormat = jsonFormat1(ErrorResponse)


  def createErrorResponse(dBResult: DBResult):ErrorResponse = {
    ErrorResponse(Seq(ApiError(dBResult.getError.getMessage,ExceptionUtils.getStackTrace(dBResult.getError))))
  }

  def createValidationResponses(f:Failure) = {
    for {v <- f.violations} yield {
      ApiError(v.constraint)
    }

  }
}