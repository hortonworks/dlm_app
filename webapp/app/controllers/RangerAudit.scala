package controllers

import com.google.inject.Inject
import com.google.inject.name.Named
import com.hw.dp.services.ranger.{RangerApi, RangerApiImpl}
import internal.GetRangerApi
import internal.persistence.ClusterDataStorage
import models.JsonResponses
import play.api.mvc._
import akka.actor.ActorRef
import akka.pattern.ask
import akka.util.Timeout
import internal.auth.Authenticated

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class RangerAudit @Inject()(@Named("atlasApiCache") val atlasApiCache: ActorRef,storage: ClusterDataStorage) extends Controller {

  import scala.concurrent.duration._
  implicit val timeout = Timeout(120 seconds)

  def error(e: Exception) =
    InternalServerError(
      JsonResponses.statusError("Server error", e.getMessage))

  val ise: PartialFunction[Throwable, Future[Result]] = {
    case e: Exception =>
      Future.successful(error(e))
  }


  def getTopUsers(clusterHost: String, datacenter: String,resourceType:String,resourceId:String) = Authenticated.async {
   getApi(clusterHost,datacenter).flatMap{ api =>
     api.getTopUsers(resourceType,resourceId).map { res =>
       Ok(res)
     }
   }.recoverWith(ise)
  }

  def getAuditLog(clusterHost: String, datacenter: String,resourceType:String,resourceId:String) = Authenticated.async {
    getApi(clusterHost,datacenter).flatMap{ api =>
      api.getRangerAuditLogs(resourceType,resourceId).map { res =>
        Ok(res)
      }
    }.recoverWith(ise)
  }


  def getTopAccessTypes(clusterHost: String, datacenter: String) = Authenticated.async{
    getApi(clusterHost,datacenter).flatMap{ api =>
      api.getTopAccessTypes.map { res =>
        Ok(res)
      }
    }.recoverWith(ise)
  }



  private def getApi(clusterHost: String,
                     datacenter: String): Future[RangerApi] = {
    for {
      ambari <- storage.loadCluster(clusterHost, datacenter)
      cluster <- storage.loadClusterInformation(clusterHost, datacenter)
      api <- (atlasApiCache ? GetRangerApi(ambari.get, cluster.get))
        .mapTo[Future[RangerApi]]
        .flatMap(f => f)
    } yield {
      api
    }
  }





}
