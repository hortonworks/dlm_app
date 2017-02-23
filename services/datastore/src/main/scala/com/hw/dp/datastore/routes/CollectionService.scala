package com.hw.dp.datastore.routes

import akka.http.scaladsl.server.Directives
import com.hw.dp.datastore.{Collection, OkResponse, RequestResponseFormatters}
import com.hw.dp.db.DBResult
import com.hw.dp.db.pg.PgDataDDLImpl

import akka.http.scaladsl.model.StatusCodes._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global



class CollectionService(val pgDataDDLImpl: PgDataDDLImpl) extends Directives with RequestResponseFormatters {

  val route = collection

  def createCollection(name: String):Future[DBResult] = {
    Future{
      pgDataDDLImpl.createCollection(name)
    }
  }


  def collection = pathPrefix("collections") {
    pathEndOrSingleSlash {
      post {
        entity(as[Collection]) { request =>
          com.wix.accord.validate(request) match {
            case com.wix.accord.Success =>
              onSuccess(createCollection(request.name)) { res =>
                   if(res.isSuccessful){
                     complete(OkResponse())
                   } else {
                     complete(InternalServerError,createErrorResponse(res))
                   }
              }

            case f@com.wix.accord.Failure(_) =>
              complete(BadRequest,createValidationResponses(f))
          }
        }
      }
    }
  }
}