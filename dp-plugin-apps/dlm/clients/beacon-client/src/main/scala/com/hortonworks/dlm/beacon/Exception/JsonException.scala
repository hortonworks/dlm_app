package com.hortonworks.dlm.beacon.Exception

case class JsonException (message: String = "", cause: Throwable = None.orNull)   extends Exception(message, cause)