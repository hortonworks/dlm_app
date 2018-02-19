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

import java.time.LocalDateTime
import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasEntities, AtlasSearchQuery, Entity}
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.cs.Webservice.{AtlasService, DpProfilerService}
import com.hortonworks.dataplane.db.Webservice._
import models.{JsonResponses, WrappedErrorsException}
import play.api.Logger
import play.api.libs.json.{Json, Reads, __}
import services.UtilityService
import com.hortonworks.dataplane.cs.Webservice.AtlasService
import com.hortonworks.dataplane.db.Webservice.{CategoryService, DataAssetService, DataSetCategoryService, DataSetService}
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import models.JsonResponses
import play.api.mvc.{Action, Controller}
import play.api.libs.functional.syntax._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class DataSets @Inject()(
    @Named("dataSetService") val dataSetService: DataSetService,
    @Named("dataAssetService") val assetService: DataAssetService,
    @Named("categoryService") val categoryService: CategoryService,
    @Named("dataSetCategoryService") val dataSetCategoryService: DataSetCategoryService,
    @Named("atlasService") val atlasService: AtlasService,
    @Named("dpProfilerService") val dpProfilerService: DpProfilerService,
    @Named("clusterService") val clusterService: com.hortonworks.dataplane.db.Webservice.ClusterService,
    @Named("ratingService") val ratingService: RatingService,
    @Named("commentService") val commentService: CommentService,
    val utilityService: UtilityService)
    extends Controller with JsonAPI {

  def list(name: Option[String]) =  Action.async {
    Logger.info("Received list dataSet request")
    dataSetService
      .list(name)
      .map {
        case Left(errors) =>
          InternalServerError(Json.toJson(errors))
        case Right(dataSets) => Ok(Json.toJson(dataSets))
      }
  }

  def create = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("Received create dataSet with categoryIds request")
    request.body
      .validate[DatasetAndTags]
      .map { dSetNTags =>
        dataSetService
          .create(dSetNTags.copy(
            dataset = dSetNTags.dataset.copy(createdBy = request.user.id)))
          .map(rDataset => Ok(Json.toJson(rDataset)))
          .recoverWith({
            case e: Exception => Future.successful(InternalServerError(Json.toJson(e.getMessage)))
          })
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def update() = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("Received update dataSet with categoryIds request")
    request.body
      .validate[DatasetAndTags]
      .map { dSetNTags =>
        dataSetService
          .update(dSetNTags.copy(
            dataset = dSetNTags.dataset.copy(lastModified = LocalDateTime.now())))
          .map(rDataset => Ok(Json.toJson(rDataset)))
          .recoverWith({
            case e: Exception => Future.successful(InternalServerError(Json.toJson(e.getMessage)))
          })
      }
      .getOrElse(Future.successful(BadRequest))
  }

  private def getAssetsFromGuids(clusterId: Long, guids:Seq[String], filterDatasetId:Long = 0)
                                (implicit token: Option[HJwtToken])
  : Future[Either[Errors, Seq[DataAsset]]]= {
    atlasService
      .getAssetsDetails(clusterId.toString, guids)
      .flatMap {
        case Left(errors) => Future.successful(Left(errors))
        case Right(atlasEntities) => {
          extractAndMarkEntities(clusterId, atlasEntities, filterDatasetId)
            .map {
              case Left(errors) => Left(errors)
              case Right(marked) =>
                val entitiesToSave =  if(filterDatasetId == 0) marked.filter(_.datasetId.isEmpty)
                                      else  marked.filter(_.datasetId.getOrElse(0) != filterDatasetId)
                Right(entitiesToSave.map(getAssetFromEntity(_, clusterId)))
            }
        }
      }
  }

  private def getAssetFromSearch(clusterId: Long, searchQuery: AtlasSearchQuery, filterDatasetId:Long = 0, exceptions: Seq[String] = Seq())(
    implicit token: Option[HJwtToken])
  : Future[Either[Errors, (Seq[DataAsset], Long, Long)]] = {
    atlasService
      .searchQueryAssets(clusterId.toString, searchQuery)
      .flatMap {
        case Left(errors) => Future.successful(Left(errors))
        case Right(atlasEntities) => {
          extractAndMarkEntities(clusterId, atlasEntities, filterDatasetId, exceptions)
            .map {
              case Left(errors) => Left(errors)
              case Right(marked) =>
                val entitiesToSave =  if(filterDatasetId == 0) marked.filter(_.datasetId.isEmpty)
                                      else  marked.filter(_.datasetId.getOrElse(0) != filterDatasetId)
                Right(entitiesToSave.map(getAssetFromEntity(_, clusterId)),
                  entitiesToSave.size, marked.size - entitiesToSave.size)
            }
        }
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

  def addSelectedAssetsToDataset = AuthenticatedAction.async(parse.json) { req =>
    implicit val token = req.token
    req.body.validate[BoxSelectionPrams].map{ params =>
      getAssetsFromGuids(params.clusterId, params.guids, params.datasetId).flatMap {
        case Left(errors) => Future.successful(InternalServerError(Json.toJson(errors)))
        case Right(assets) =>  assets.size match {
          case 0 =>
            Logger.info("Effectively no asset to add.")
            Future.successful(Conflict)
          case _ => dataSetService
            .addAssets(params.datasetId, assets)
            .map(rDataset =>
              // TODO Modify Profiler data
              Ok(Json.toJson(rDataset))
            )
            .recoverWith({
              case e: Exception => Future.successful(InternalServerError(Json.toJson(e.getMessage)))
            })
        }
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  def addAssetsToDataset = AuthenticatedAction.async(parse.json) { req =>
    implicit val token = req.token
    req.body.validate[AddToBoxPrams].map{ params =>
      getAssetFromSearch(params.clusterId, params.assetQueryModel, params.datasetId, params.exceptions).flatMap {
        case Left(errors) => Future.successful(InternalServerError(Json.toJson(errors)))
        case Right((assets, _, _)) =>  assets.size match {
          case 0 =>
            Logger.info("Effectively no asset to add.")
            dataSetService
              .getRichDatasetById(params.datasetId,req.user.id.get)
              .map {
                case Left(errors) => InternalServerError(Json.toJson(errors))
                case Right(richDataset) => Ok(Json.toJson(richDataset))
              }
          case _ => dataSetService
            .addAssets(params.datasetId, assets)
            .map(rDataset =>
             // TODO Modify Profiler data
             Ok(Json.toJson(rDataset))
            )
            .recoverWith({
             case e: Exception => Future.successful(InternalServerError(Json.toJson(e.getMessage)))
            })
        }
      }
    }.getOrElse(Future.successful(BadRequest))
  }

  def removeAssetsFromDataset(datasetId: Long) = AuthenticatedAction.async { req =>
    implicit val token = req.token
    dataSetService
      .removeAssets(datasetId, req.rawQueryString)
      .map(rDataset =>
        // TODO Modify Profiler data
        Ok(Json.toJson(rDataset))
      )
      .recoverWith({
        case e: Exception => Future.successful(InternalServerError(Json.toJson(e.getMessage)))
      })
  }


  def removeAllAssetsFromDataset(datasetId: Long) = AuthenticatedAction.async { req =>
    implicit val token = req.token
    dataSetService
      .removeAllAssets(datasetId)
      .map(rDataset =>
        // TODO Modify Profiler data
        Ok(Json.toJson(rDataset))
      )
      .recoverWith({
        case e: Exception => Future.successful(InternalServerError(Json.toJson(e.getMessage)))
      })
  }

  def createDatasetWithAtlasSearch = AuthenticatedAction.async(parse.json) {
    request =>
      implicit val token = request.token
      request.body
        .validate[DatasetCreateRequest]
        .map { req =>
          getAssetFromSearch(req.clusterId, req.assetQueryModels.head).flatMap {
            case Right((assets, countOfSaved, countOfIgnored)) =>
              countOfSaved match {
                case 0 => Future.successful(InternalServerError(JsonResponses.statusError("Unable to create an asset collection with 0 assets.")))
                case _ => {
                  val newReq =
                    req.copy(dataset =
                      req.dataset.copy(createdBy = request.user.id),
                      dataAssets = assets)
                  dataSetService
                    .create(newReq)
                    .map {
                      case Left(errors) =>{
                        errors.firstMessage match {
                          case 409 => InternalServerError(JsonResponses.statusError(s"An asset collection with this name already exists."))
                          case _ => InternalServerError(Json.toJson(errors))
                        }
                      }
                      case Right(dataSetNCategories) => {
                        val dsId = dataSetNCategories.dataset.id.get
                        val dsName = dataSetNCategories.dataset.name
                        val list = assets.map {
                          asset => ((asset.assetProperties \ "qualifiedName").as[String]).split("@").head
                        }
                        (for {
                          jobName <- utilityService.doGenerateJobName(dsId, dsName)
                          results <- dpProfilerService.startAndScheduleProfilerJob(req.clusterId.toString, jobName, list)
                        } yield results)
                          .onComplete {
                            case Success(Right(attributes))=> Logger.info(s"Started and Scheduled Profiler, 200 response, ${Json.toJson(attributes)}")
                            case Success(Left(errors)) => Logger.error(s"Start and Schedule Profiler Failed with ${errors.errors.head.status} ${Json.toJson(errors)}")
                            case Failure(th) => Logger.error(th.getMessage, th)
                          }
                        Ok(
                          Json.obj("result" -> Json.toJson(dataSetNCategories),
                            "countOfSaved" -> countOfSaved,
                            "countOfIgnored" -> countOfIgnored))
                      }
                    }
                }
              }
            case Left(errors) =>
              Future.successful(InternalServerError(Json.toJson(errors)))
          }
        }
        .getOrElse(Future.successful(BadRequest))
  }


  def getRichDataset = AuthenticatedAction.async { req =>
    dataSetService
      .listRichDataset(req.rawQueryString,req.user.id.get)
      .map {
        case Left(errors) =>
          InternalServerError(Json.toJson(errors))
        case Right(dataSets) => Ok(Json.toJson(dataSets))
      }
  }

  def getRichDatasetByTag(tagName: String) = AuthenticatedAction.async { req =>
    val loggedinUserId = req.user.id.get
    val future =
      if (tagName.equalsIgnoreCase("all"))
        dataSetService.listRichDataset(req.rawQueryString,loggedinUserId)
      else dataSetService.listRichDatasetByTag(tagName, req.rawQueryString, loggedinUserId)

    future.map {
      case Left(errors) =>
        InternalServerError(Json.toJson(errors))
      case Right(dataSets) => Ok(Json.toJson(dataSets))
    }
  }

  def getRichDatasetById(id: String) =  AuthenticatedAction.async { req =>
    Logger.info("Received retrieve dataSet request")
    if(Try(id.toLong).isFailure){
      Future.successful(BadRequest)
    }else{
      dataSetService
        .getRichDatasetById(id.toLong,req.user.id.get)
        .map {
          case Left(errors)
            if errors.errors.size > 0 && errors.errors.head.status == 404 =>
            NotFound
          case Left(errors) =>
            InternalServerError(Json.toJson(errors))
          case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
        }
    }
  }

  def getDataAssetsByDatasetId(datasetId: String,
                               queryName: String,
                               offset: Long,
                               limit: Long) =  Action.async {
    dataSetService
      .getDataAssetByDatasetId(datasetId.toLong, queryName, offset, limit)
      .map {
        case Left(errors) =>
          InternalServerError(Json.toJson(errors))
        case Right(dataSets) => Ok(Json.toJson(dataSets))
      }
  }

  def retrieve(dataSetId: String) = Action.async {
    Logger.info("Received retrieve dataSet request")
    dataSetService
      .retrieve(dataSetId)
      .map {
        case Left(errors)
            if errors.errors.size > 0 && errors.errors.head.status == 404 =>
          NotFound
        case Left(errors) =>
          InternalServerError(Json.toJson(errors))
        case Right(dataSetNCategories) => Ok(Json.toJson(dataSetNCategories))
      }
  }

  def updateDataset(datasetId : String) = AuthenticatedAction.async(parse.json) { request =>
    Logger.info("Received update dataSet request")
    request.body
      .validate[Dataset]
      .map { dataset =>
        val loggedinUser = request.user.id.get
        if(loggedinUser != dataset.createdBy.get) Future.successful(Unauthorized("this user is not authorized to perform this action"))
        else{
          dataSetService
            .updateDataset(datasetId, dataset)
            .map { dataset =>
              Ok(Json.toJson(dataset))
            }
            .recover(apiError)
        }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def delete(dataSetId: String) =  AuthenticatedAction.async { request =>
    implicit val token = request.token
    Logger.info("Received delete dataSet request")
    (for {
      dataset <- doGetDataset(dataSetId,request.user.id.get)
      cmntDelMsg <- commentService.deleteByObjectRef(dataSetId, "assetCollection")
      clusterId <- doGetClusterIdFromDpClusterId(dataset.dpClusterId.toString)
      _ <- ratingService.deleteByObjectRef(dataSetId, "assetCollection")
      deleted <- doDeleteDataset(dataset.id.get.toString)
      jobName <- utilityService.doGenerateJobName(dataset.id.get, dataset.name)
      _ <- doDeleteProfilers(clusterId, jobName)
    }  yield {
      Ok(Json.obj("datasetsDeleted" -> deleted,"commentsDeleted" -> cmntDelMsg))
    })
    .recover{
      case ex: WrappedErrorsException => InternalServerError(Json.toJson(ex.errors))
    }
  }

  def listAllCategories = Action.async {
    Logger.info("Received list dataSet-categories request")
    categoryService
      .list()
      .map {
        case Left(errors) =>
          InternalServerError(Json.toJson(errors))
        case Right(categories) => Ok(Json.toJson(categories))
      }
  }

  def searchCategories(searchText: String, size: Option[Long]) =
    Action.async {
      Logger.info("Received list dataSet-categories request")
      categoryService
        .search(searchText, size)
        .map {
          case Left(errors) =>
            InternalServerError(Json.toJson(errors))
          case Right(categories) => Ok(Json.toJson(categories))
        }
    }

  def createCategory = Action.async(parse.json) { request =>
    Logger.info("Received create dataSet-category request")
    request.body
      .validate[Category]
      .map { category =>
        categoryService
          .create(category)
          .map {
            case Left(errors) =>
              InternalServerError(Json.toJson(errors))
            case Right(category) => Ok(Json.toJson(category))
          }
      }
      .getOrElse(Future.successful(BadRequest))
  }

  def listCategoriesCount(search: Option[String]) =  AuthenticatedAction.async { req =>
    categoryService
      .listWithCount(search, req.user.id.get)
      .map {
        case Left(errors) =>
          InternalServerError(Json.toJson(errors))
        case Right(categories) => Ok(Json.toJson(categories))
      }
  }

  def getCategoryCount(categoryId: String) = Action.async {
    categoryService
      .listWithCount(categoryId)
      .map {
        case Left(errors) =>
          InternalServerError(Json.toJson(errors))
        case Right(categoryCount) => Ok(Json.toJson(categoryCount))
      }
  }

  // Extracts entities and mark them with dataset name and Id
  private def extractAndMarkEntities(clstrId: Long, atlasEntities: AtlasEntities, prefDatasetId:Long = 0, exceptions: Seq[String] = Seq())
  : Future[Either[Errors, Seq[Entity]]] = {
    val entities = atlasEntities.entities.getOrElse(Seq[Entity]())
    val assetIds: Seq[String] = entities.filter(_.guid.nonEmpty) map (_.guid.get)
    assetService
      .findManagedAssets(clstrId, assetIds)
      .map {
        case Left(errors) => Left(errors)
        case Right(relations) => Right(
          entities
            .filter(ent => exceptions.find(_ == ent.guid.getOrElse(None)).isEmpty)
            .map { ent =>
              (relations.find(rel => rel.guid == ent.guid.get && rel.datasetId == prefDatasetId) match {
                case Some(relation) => Some(relation)
                case None => relations.find(_.guid == ent.guid.get)
              })
              match {
                case None => ent
                case Some(ds) => ent.copy(
                  datasetId = Option(ds.datasetId),
                  datasetName = Option(ds.datasetName)
                )
              }
            }
        )
      }
  }

  private def doDeleteDataset(datasetId: String): Future[Long] = {
    dataSetService
      .delete(datasetId.toString)
      .flatMap {
        case Left(errors) => Future.failed(WrappedErrorsException(errors))
        case Right(deleted) => Future.successful(deleted)
      }
  }

  private def doDeleteProfilers(clusterId: String, jobName: String)(implicit token:Option[HJwtToken]): Future[Boolean] = {
    dpProfilerService
      .deleteProfilerByJobName(clusterId.toLong, jobName)
      .flatMap {
        case Right(attributes) => {
          Logger.info(s"Delete Profiler, 200 response, ${Json.toJson(attributes)}")
          Future.successful(true)
        }
        case Left(errors) => {
          Logger.error(s"Delete Profiler Failed with ${errors.errors.head.status} ${Json.toJson(errors)}")
          Future.successful(false)
        }
      }
  }

  private def doGetClusterIdFromDpClusterId(dpClusterId: String): Future[String] = {
    clusterService
      .getLinkedClusters(dpClusterId.toLong)
      .flatMap {
        case Left(errors) => Future.failed(WrappedErrorsException(errors))
        case Right(clusters) => Future.successful(clusters.head.id.get.toString)
      }
  }

  private def doGetDataset(datasetId: String,userId: Long): Future[Dataset] = {
    dataSetService
      .getRichDatasetById(datasetId.toLong,userId)
      .flatMap {
        case Left(errors) => Future.failed(WrappedErrorsException(errors))
        case Right(dataset) => Future.successful(dataset.dataset)
      }
  }

}
