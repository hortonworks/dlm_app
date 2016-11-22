package models

import play.api.libs.json.Json

object JsonResponses {

  val statusOk = Json.obj("message"->"ok")
  def statusError(msg:String,trace:String="") = Json.obj("message"->msg,"trace"->trace)

}