package com.hortonworks.dataplane.http.routes

import akka.http.scaladsl.model.StatusCode
import akka.http.scaladsl.model.StatusCodes

abstract class ClusterServiceException
  extends Exception {

  val code: Long
  val message: String
  val http: StatusCode = StatusCodes.InternalServerError
}

case class UnsupportedInputException(val code: Long, val message: String, override val http: StatusCode = StatusCodes.BadRequest) extends ClusterServiceException
