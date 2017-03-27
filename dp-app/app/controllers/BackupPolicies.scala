package controllers

import javax.inject.Inject

import internal.MongoUtilities
import internal.auth.Authenticated
import internal.persistence.ClusterDataStorage
import models._
import play.api.mvc.Controller
import play.modules.reactivemongo.{MongoController, ReactiveMongoApi, ReactiveMongoComponents}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future


class BackupPolicies @Inject()(
    val reactiveMongoApi: ReactiveMongoApi,
    val storage: ClusterDataStorage
  ) extends Controller with MongoController with ReactiveMongoComponents with MongoUtilities {


  def create = Authenticated.async(parse.json) { request =>
    Future.successful(Ok(JsonResponses.statusOk))  }

  def list(dataCenterId: Option[String], clusterId: Option[String], resourceId: Option[String], resourceType: Option[String]) = Authenticated.async {
    Future.successful(Ok(JsonResponses.statusOk))  }

  def get(id: String) = Authenticated.async {
    Future.successful(Ok(JsonResponses.statusOk))  }

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
        policy.status,
        policy.schedule
      )
    }
  }
}
