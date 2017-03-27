package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities._
import play.api.libs.json.{JsResult, Json}
import play.api.libs.ws.WSResponse
import com.hortonworks.dataplane.commons.domain.Entities.{
  ClusterService => ClusterData
}

import scala.concurrent.Future

object Webserice {

  trait DbClientService {

    import com.hortonworks.dataplane.commons.domain.JsonFormatters._

    protected def extractEntity[T](res: WSResponse,
                                   f: WSResponse => T): Either[Errors, T] = {
      Right(f(res))
    }

    protected def extractError(res: WSResponse,
                               f: WSResponse => JsResult[Errors]): Errors = {
      if (res.body.isEmpty)
        Errors()
      f(res).map(r => r).getOrElse(Errors())
    }

    protected def mapErrors(res: WSResponse) = {
      Left(extractError(res, r => r.json.validate[Errors]))
    }

  }

  trait UserService extends DbClientService {

    def loadUser(username: String): Future[Either[Errors, User]]
    def getUserRoles(userName: String): Future[Either[Errors, UserRoles]]

    def addUser(user: User): Future[Either[Errors, User]]
    def addRole(role: Role): Future[Either[Errors, Role]]
    def addUserRole(userRole: UserRole): Future[Either[Errors, UserRole]]

  }

  trait LakeService extends DbClientService {

    def list(): Future[Either[Errors, Seq[Datalake]]]
    def create(datalake: Datalake): Future[Either[Errors, Datalake]]
    def retrieve(datalakeId: String): Future[Either[Errors, Datalake]]
    def update(datalakeId: String,
               datalake: Datalake): Future[Either[Errors, Datalake]]
    def delete(datalakeId: String): Future[Either[Errors, Datalake]]

  }


  trait LocationService extends DbClientService {

    def list(query: Option[String]): Future[Either[Errors, Seq[Location]]]

  }


  trait ClusterService extends DbClientService {

    def list(): Future[Either[Errors, Seq[Cluster]]]
    def getLinkedClusters(
        datalakeId: Long): Future[Either[Errors, Seq[Cluster]]]

  }

  // Maps to ClusterService
  trait ClusterComponentService extends DbClientService {

    def create(clusterService: ClusterData): Future[Either[Errors, ClusterData]]
    def getServiceByName(clusterId:Long,serviceName:String):Future[Either[Errors, ClusterData]]
    def updateServiceByName(clusterData: ClusterData):Future[Either[Errors, Boolean]]

  }

}
