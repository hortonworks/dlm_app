package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Atlas.AtlasSearchQuery
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import internal.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class QueryAssets @Inject()(
                               @Named("atlasService")
                               val atlasService: AtlasService,
                               val authenticated: Authenticated
                          ) extends Controller {

  def search(clusterId: String) = authenticated.async(parse.json) { request =>
    Logger.info("Received get cluster atlas search request")

    request.body.validate[AtlasSearchQuery].map { filters =>
      atlasService.searchQueryAssets(clusterId, filters)
        .map {
          results => results match {
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(results) => Ok(Json.toJson(results))
          }
        }
    }.getOrElse(Future.successful(BadRequest))


  }

}
