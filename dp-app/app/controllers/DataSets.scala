package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasEntities, Entity}
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.db.Webservice.{
  CategoryService,
  DataAssetService,
  DataSetCategoryService,
  DataSetService
}
import internal.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class DataSets @Inject()(
    @Named("dataSetService") val dataSetService: DataSetService,
    @Named("dataAssetService") val assetService: DataAssetService,
    @Named("categoryService") val categoryService: CategoryService,
    @Named("dataSetCategoryService") val dataSetCategoryService: DataSetCategoryService,
    @Named("atlasService") val atlasService: AtlasService,
    authenticated: Authenticated)
    extends Controller {

  def list = authenticated.async {
    Logger.info("Received list dataSet request")
    dataSetService
      .list()
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataSets) => Ok(Json.toJson(dataSets))
      }
  }

  def create = authenticated.async(parse.json) { request =>
    Logger.info("Received create dataSet request")
    request.body
      .validate[DatasetAndCategoryIds]
      .map { dSetNCtgryIds =>
        dataSetService
          .create(dSetNCtgryIds.copy(
            dataset = dSetNCtgryIds.dataset.copy(createdBy = request.user.id)))
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(dataSetNCategories) =>
              Ok(Json.toJson(dataSetNCategories))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  private def getAssetFromSearch(req: DatasetCreateRequest)(
      implicit token: Option[HJwtToken])
    : Future[Either[Errors, (Seq[DataAsset], Long, Long)]] = {
    val future = for {
      results <- atlasService.searchQueryAssets(req.clusterId.toString,
                                                req.assetQueryModels.head)
      enhancedResults <- doEnhanceAssetsWithOwningDataset(
        req.clusterId.toString,
        results)
    } yield enhancedResults

    future
      .map {
        case Left(errors) => Left(errors)
        case Right(enhanced) =>
          val entitiesToSave =
            enhanced.filter(cEntity => cEntity.datasetId.isEmpty)
          Right(entitiesToSave.map(cEntity =>
                  getAssetFromEntity(cEntity, req.clusterId)),
                entitiesToSave.size,
                enhanced.size - entitiesToSave.size)
      }
  }

  private def getAssetFromEntity(entity: Entity, clusterId: Long): DataAsset = {
    DataAsset(None,
              entity.typeName.get,
              entity.attributes.get.get("name").get,
              entity.guid.get,
              Json.toJson(entity.attributes.get),
              clusterId)
  }

  def createDatasetWithAtlasSearch = authenticated.async(parse.json) {
    request =>
      implicit val token = request.token
      request.body
        .validate[DatasetCreateRequest]
        .map { req =>
          getAssetFromSearch(req).flatMap {
            case Right((assets, countOfSaved, countOfIgnored)) =>
              val newReq =
                req.copy(dataset =
                           req.dataset.copy(createdBy = request.user.id),
                         dataAssets = assets)
              dataSetService
                .create(newReq)
                .map {
                  case Left(errors) =>
                    InternalServerError(JsonResponses.statusError(
                      s"Failed with ${Json.toJson(errors)}"))
                  case Right(dataSetNCategories) =>
                    Ok(
                      Json.obj("result" -> Json.toJson(dataSetNCategories),
                               "countOfSaved" -> countOfSaved,
                               "countOfIgnored" -> countOfIgnored))
                }
            case Left(errors) =>
              Future.successful(InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}")))
          }
        }
        .getOrElse(Future.successful(BadRequest))
  }

  def getRichDataset = authenticated.async { req =>
    dataSetService
      .listRichDataset(req.rawQueryString)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataSets) => Ok(Json.toJson(dataSets))
      }
  }

  def getRichDatasetByTag(tagName: String) = authenticated.async { req =>
    val future =
      if (tagName.equalsIgnoreCase("all"))
        dataSetService.listRichDataset(req.rawQueryString)
      else dataSetService.listRichDatasetByTag(tagName, req.rawQueryString)

    future.map {
      case Left(errors) =>
        InternalServerError(
          JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
      case Right(dataSets) => Ok(Json.toJson(dataSets))
    }
  }

  def getRichDatasetById(id: Long) = authenticated.async {
    Logger.info("Received retrieve dataSet request")
    dataSetService
      .getRichDatasetById(id)
      .map {
        case Left(errors)
            if errors.errors.size > 0 && errors.errors.head.code == "404" =>
          NotFound
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
      }
  }

  def getDataAssetsByDatasetId(id: Long,
                               queryName: String,
                               offset: Long,
                               limit: Long) = authenticated.async {
    dataSetService
      .getDataAssetByDatasetId(id, queryName, offset, limit)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataSets) => Ok(Json.toJson(dataSets))
      }
  }

  def retrieve(dataSetId: String) = authenticated.async {
    Logger.info("Received retrieve dataSet request")
    dataSetService
      .retrieve(dataSetId)
      .map {
        case Left(errors)
            if errors.errors.size > 0 && errors.errors.head.code == "404" =>
          NotFound
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
      }
  }

  def update() = authenticated.async(parse.json) { request =>
    Logger.info("Received update dataSet request")
    request.body
      .validate[DatasetAndCategoryIds]
      .map { dSetNCtgryIds =>
        dataSetService
          .update(dSetNCtgryIds)
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(dataSetNCategories) =>
              Ok(Json.toJson(dataSetNCategories))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(dataSetId: String) = authenticated.async {
    Logger.info("Received delete dataSet request")
    dataSetService
      .delete(dataSetId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(dataSet) => Ok(Json.toJson(dataSet))
      }
  }

  def listAllCategories = authenticated.async {
    Logger.info("Received list dataSet-categories request")
    categoryService
      .list()
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(categories) => Ok(Json.toJson(categories))
      }
  }

  def searchCategories(searchText: String, size: Option[Long]) =
    authenticated.async {
      Logger.info("Received list dataSet-categories request")
      categoryService
        .search(searchText, size)
        .map {
          case Left(errors) =>
            InternalServerError(
              JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(categories) => Ok(Json.toJson(categories))
        }
    }

  def createCategory = authenticated.async(parse.json) { request =>
    Logger.info("Received create dataSet-category request")
    request.body
      .validate[Category]
      .map { category =>
        categoryService
          .create(category)
          .map {
            case Left(errors) =>
              InternalServerError(JsonResponses.statusError(
                s"Failed with ${Json.toJson(errors)}"))
            case Right(category) => Ok(Json.toJson(category))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def listCategoriesCount(search: Option[String]) = authenticated.async {
    request =>
      categoryService
        .listWithCount(search)
        .map {
          case Left(errors) =>
            InternalServerError(
              JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(categories) => Ok(Json.toJson(categories))
        }
  }

  def getCategoryCount(categoryId: String) = authenticated.async { request =>
    categoryService
      .listWithCount(categoryId)
      .map {
        case Left(errors) =>
          InternalServerError(
            JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
        case Right(categoryCount) => Ok(Json.toJson(categoryCount))
      }
  }

  private def doEnhanceAssetsWithOwningDataset(
      clusterIdAsString: String,
      atlasEntities: Either[Errors, AtlasEntities])
    : Future[Either[Errors, Seq[Entity]]] = {
    atlasEntities match {
      case Left(errors) => Future.successful(Left(errors))
      case Right(atlasEntities) =>
        val entities = atlasEntities.entities.getOrElse(Seq[Entity]())
        val assetIds
          : Seq[String] = entities.filter(_.guid.nonEmpty) map (_.guid.get)
        val clusterId = clusterIdAsString.toLong
        assetService
          .findManagedAssets(clusterId, assetIds)
          .map {
            case Left(errors) => Left(errors)
            case Right(relationships) =>
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
