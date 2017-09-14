package com.hortonworks.dataplane.http.routes

abstract class ClusterServiceException
  extends Exception {

  def code
  def message
}

case class UnsupportedInputException(code: Long, message: String) extends ClusterServiceException
