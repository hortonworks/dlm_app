package com.hw.dp.datastore


//Requests
case class Collection(name:String)
case class OkResponse(status:String = "OK")
case class Pagination(count:Long,pageSize:Int,limit:Int,offset:Int)

case class Response(data:String,pagination:Pagination)

case class ApiError(message:String="",trace:String="")

case class ErrorResponse(errors:Seq[ApiError])
