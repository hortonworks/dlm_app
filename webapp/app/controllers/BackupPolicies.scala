package controllers

import javax.inject.Inject
import java.time.Instant

import internal.auth.Authenticated
import internal.MongoUtilities
import internal.persistence.ClusterDataStorage
import models._
import models.BackupPolicyFormatters._
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}
import reactivemongo.api.Cursor
import reactivemongo.play.json.collection.JSONCollection
import play.modules.reactivemongo.json._

import scala.concurrent
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Created by abkumar on 22/12/16.
  */
class BackupPolicies @Inject()(
    val reactiveMongoApi: ReactiveMongoApi,
    val storage: ClusterDataStorage
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
              val cPolicyStamped = cPolicy.copy(
                status = cPolicy.status.copy(
                  since = Option(Instant.now().toString())
                )
              )
              policies.flatMap(_.insert(cPolicyStamped)).map { wr =>
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

  def list(dataCenter: Option[String], cluster: Option[String], resourceId: Option[String], resourceType: Option[String]) = Authenticated.async {
    policies
      .flatMap(
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
    storage.getBackupPolicyById(id)
      .flatMap(
        _
        .map(cPolicy =>
          getBackupPolicyInDetail(cPolicy)
          .flatMap(cPolicyInDetail => Future.successful(Ok(Json.toJson(cPolicyInDetail))))
          .recoverWith{
            case e:Exception => Future.successful(InternalServerError(JsonResponses.statusError("fetch error",e.getMessage)))

          }
        )
        .getOrElse(Future.successful(NotFound))
      )
      .recoverWith {
        case e:Exception => Future.successful(InternalServerError(JsonResponses.statusError("fetch error",e.getMessage)))
      }
  }

  def getBackupPolicyInDetail(policy: BackupPolicy): Future[BackupPolicyInDetail] = {
    for {
      sourceDataCenter <- storage.getDataCenterById(policy.source.dataCenterId)
      sourceCluster <- storage.getClusterById(policy.source.clusterId)
      targetDataCenter <- storage.getDataCenterById(policy.target.dataCenterId)
      targetCluster <- storage.getClusterById(policy.target.clusterId)
    } yield {
      BackupPolicyInDetail(
        policy.label,
        SourceInDetail(sourceDataCenter.get, sourceCluster.get, policy.source.resourceId, policy.source.resourceType),
        TargetInDetail(targetDataCenter.get, targetCluster.get),
        policy.status
      )
    }
  }
}
