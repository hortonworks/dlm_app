package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.DataAssetService
import internal.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class QueryManagedAssets @Inject()(
                              @Named("dataAssetService")
                              val assetService: DataAssetService,
                              val authenticated: Authenticated
                          ) extends Controller {

  def findManagedAssets(clusterId: Long) = authenticated.async(parse.json) { request =>
    Logger.info("Received asset de-duplication request")

    request.body.validate[Seq[String]].map { assets: Seq[String] =>
      assetService.findManagedAssets(clusterId, assets)
        .map {
          results => results match {
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(results) => Ok(Json.toJson(results))
          }
        }
    }.getOrElse(Future.successful(BadRequest))


  }

}
