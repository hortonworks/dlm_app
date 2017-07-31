package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Atlas.{
  AtlasEntities,
  AtlasSearchQuery,
  Entity
}
import com.hortonworks.dataplane.commons.domain.Entities.Errors
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.db.Webservice.DataAssetService
import com.hortonworks.dataplane.commons.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class QueryAssets @Inject()(
    @Named("atlasService") val atlasService: AtlasService,
    @Named("dataAssetService") val assetService: DataAssetService,
    val authenticated: Authenticated
) extends Controller {

  def search(clusterId: String) = authenticated.async(parse.json) { request =>
    Logger.info("Received get cluster atlas search request")
    implicit val token = request.token
    request.body
      .validate[AtlasSearchQuery]
      .map { filters =>
        val future = for {
          results <- atlasService.searchQueryAssets(clusterId, filters)
          enhancedResults <- doEnhanceAssetsWithOwningDataset(clusterId,
                                                              results)
        } yield enhancedResults

        future
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(enhanced) => Ok(Json.toJson(enhanced))
          }
      }
      .getOrElse(Future.successful(BadRequest))

  }

  private def doEnhanceAssetsWithOwningDataset(
      clusterIdAsString: String,
      atlasEntities: Either[Errors, AtlasEntities])
    : Future[Either[Errors, Seq[Entity]]] = {
    atlasEntities match {
      case Left(errors) => Future.successful(Left(errors))
      case Right(atlasEntities) =>
        val entities = atlasEntities.entities.getOrElse(Nil)
        val assetIds
          : Seq[String] = entities.filter(_.guid.nonEmpty) map (_.guid.get)
        val clusterId = clusterIdAsString.toLong
        assetService
          .findManagedAssets(clusterId, assetIds)
          .map {
            case Left(errors) => Left(errors)
            case Right(relationships) => {
              val enhanced = entities.map { cEntity =>
                val cRelationship =
                  relationships.find(_.guid == cEntity.guid.get)
                cRelationship match {
                  case None => cEntity
                  case Some(relationship) =>
                    cEntity.copy(
                      datasetId = Option(relationship.datasetId),
                      datasetName = Option(relationship.datasetName))
                }

              }
              Right(enhanced)
            }
          }
    }
  }

}
