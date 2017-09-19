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
package controllers
import play.api.mvc._
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.http.HeaderNames._
class ResponseHeaderFilter extends EssentialFilter {
  def apply(nextFilter: EssentialAction) = new EssentialAction {
    def apply(requestHeader: RequestHeader) = {
      nextFilter(requestHeader).map { result =>
        result.withHeaders(CACHE_CONTROL->"no-cache, no-store, max-age=0, must-revalidate",
          PRAGMA->"no-cache",
          EXPIRES->"0"
        )
      }
    }
  }
}