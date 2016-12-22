package controllers

import javax.inject.Inject

import com.hw.dp.service.cluster.{DataCenter, Cluster}
import internal.auth.Authenticated
import internal.MongoUtilities
import internal.persistence.DataStorage
import models._
import models.BackupPolicyFormatters._
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.api.Cursor
import reactivemongo.play.json.collection.JSONCollection
import play.modules.reactivemongo.json._
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.Future

/**
  * Created by abkumar on 22/12/16.
  */
class BackupPolicyController @Inject()(
    val reactiveMongoApi: ReactiveMongoApi,
    val storage: DataStorage
  ) extends Controller with MongoController with ReactiveMongoComponents with MongoUtilities {

  def clusters = database.map(_.collection[JSONCollection]("clusters"))

  def clustersInfo = database.map(_.collection[JSONCollection]("clusterInfo"))

  def dataCenters = database.map(_.collection[JSONCollection]("datacenters"))

  def policies = database.map(_.collection[JSONCollection]("backupPolicies"))

  def create = Authenticated.async(parse.json) { request =>
    Logger.info("Received create policy request")

    request.body.validate[BackupPolicy].map {
      cPolicy: BackupPolicy =>
        policies
          .flatMap(
            _
              .find(Json.obj("label" -> cPolicy.label))
              .one[BackupPolicy]
          )
          .flatMap({ fPolicy =>
            if (fPolicy.isDefined)
              Future.successful(UnprocessableEntity(JsonResponses.statusError("Policy exists")))
            else {
              policies.flatMap(_.insert(cPolicy)).map { wr =>
                if (wr.ok)
                  Ok(Json.obj("status" -> "success", "errorcode" -> 0))
                else
                  InternalServerError(JsonResponses.statusError("insert error", extractWriteError(wr)))
              }
            }
          }).recoverWith {
            case e:Exception => Future.successful(InternalServerError(JsonResponses.statusError("create error",e.getMessage)))
          }
    }.getOrElse(Future.successful(BadRequest))
  }

  def list = Authenticated.async {
    policies.flatMap(
      _
        .find(Json.obj())
        .cursor[BackupPolicy]()
        .collect[List](maxDocs = 0, Cursor.FailOnError[List[BackupPolicy]]())
        .flatMap {
          policyList =>
            Logger.info(s"Fetched ${policyList.size} policies")
            Future.successful(Ok(Json.toJson(policyList)))
        }).recoverWith {
          case e:Exception => Future.successful(InternalServerError(JsonResponses.statusError("fetch error",e.getMessage)))
        }
  }

  def get(id: String) = Authenticated.async {
    getBackupPolicyById(id)
        .flatMap(
          cPolicy =>
            for {
              sourceDataCenter <- getDataCenterById(cPolicy.source.dataCenterId)
              sourceCluster <- getClusterById(cPolicy.source.clusterId)
              targetDataCenter <- getDataCenterById(cPolicy.target.dataCenterId)
              targetCluster <- getClusterById(cPolicy.target.clusterId)
            } yield {
              BackupPolicyInDetail(
                cPolicy.label,
                SourceInDetail(sourceDataCenter, sourceCluster, cPolicy.source.resourceId, cPolicy.source.resourceType),
                TargetInDetail(targetDataCenter, targetCluster),
                cPolicy.status
              )
            }
        )
        .map(policyInDetail => Ok(Json.toJson(policyInDetail)))
        .recoverWith {
          case e:Exception => Future.successful(InternalServerError(JsonResponses.statusError("fetch error",e.getMessage)))
        }
  }

  def getBackupPolicyById(id: String): Future[BackupPolicy] = {
    policies.flatMap(
      _
        .find(Json.obj("label" -> id))
        .requireOne[BackupPolicy]
    )
  }

  def getDataCenterById(id: String): Future[DataCenter] = {
    import com.hw.dp.service.cluster.Formatters._

    dataCenters.flatMap(
      _
        .find(Json.obj("name" -> id))
        .requireOne[DataCenter]
    )
  }

  def getClusterById(id: String): Future[Cluster] = {
    import com.hw.dp.service.cluster.Formatters._

    clusters.flatMap(
      _
        .find(Json.obj("host" -> id))
        .requireOne[Cluster]
    )
  }
}
