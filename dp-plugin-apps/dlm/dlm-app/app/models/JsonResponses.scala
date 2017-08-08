/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package models

import play.api.libs.json.Json

object JsonResponses {

  val statusOk = Json.obj("message"->"ok")
  def statusError(msg:String,trace:String="") = Json.obj("message"->msg,"trace"->trace)
}