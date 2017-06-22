package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasSearchQuery, Entity}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.db.Webservice.DataAssetService
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
                               @Named("dataAssetService")
                               val assetService: DataAssetService,
                               val authenticated: Authenticated
                          ) extends Controller {

  def search(clusterId: String) = authenticated.async(parse.json) { request =>
    Logger.info("Received get cluster atlas search request")

    request.body.validate[AtlasSearchQuery].map { filters =>

      getAssets(clusterId, filters)
        .flatMap(entities => enhanceAssetsWithOwningDataset(clusterId, entities))
        .map {
          entities => Ok(Json.toJson(entities))
        }
        .recoverWith(InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}")))
    }.getOrElse(Future.successful(BadRequest))


  }

  private def getAssets(clusterId: Long, filters: AtlasSearchQuery): Future[Seq[Entity]] = {
    atlasService.searchQueryAssets(clusterId, filters)
        .map { results => results match {
            case Left(errors) => Future.failed(errors)
            case Right(atlasEntities) => Future.successful(atlasEntities.entities.getOrElse(Seq()))
          }
        }
  }

  private def enhanceAssetsWithOwningDataset(clusterId: Long, entities: Seq[Entity]): Future[Seq[Entity]] = {
    val assetIds: Seq[String] = entities.filter(_.guid.nonEmpty)map(_.guid.get)
    assetService.findManagedAssets(clusterId, assetIds)
      .map {
        results => results match {
          case Left(errors) => Future.failed(errors)
          case Right(datasetInformation) => {

            entities.map { cEntity =>

              val dsInfo = datasetInformation.find(_.value("guid") == cEntity.guid)

              dsInfo match {
                case None => cEntity
                case Some(dsInfo) => cEntity.copy(
                  datasetId = Option(dsInfo.value("datasetId")),
                  datasetName = Option(dsInfo.value("datasetName"))
                )
              }

            }
          }
        }
      }
  }

}
