package com.hortonworks.dataplane.commons.service.api

case class ServiceNotFound(message:String) extends Exception(message)
case class ServiceException(message:String) extends Exception(message)

