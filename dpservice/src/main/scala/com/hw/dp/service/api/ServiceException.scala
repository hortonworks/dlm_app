package com.hw.dp.service.api

case class ServiceNotFound(message:String) extends Exception(message)
case class ServiceException(message:String) extends Exception(message)

