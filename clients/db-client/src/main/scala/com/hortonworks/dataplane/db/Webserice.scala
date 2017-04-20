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

  trait DataSetService extends DbClientService {

    def list(): Future[Either[Errors, Seq[Dataset]]]
    def create(dataSetAndCatIds: DatasetAndCategoryIds): Future[Either[Errors, DatasetAndCategories]]
    def retrieve(dataSetId: String): Future[Either[Errors, DatasetAndCategories]]
    def update(dataSetAndCatIds: DatasetAndCategoryIds): Future[Either[Errors, DatasetAndCategories]]
    def delete(dataSetId: String): Future[Either[Errors, Dataset]]
  }

  trait CategoryService extends DbClientService {

    def list(): Future[Either[Errors, Seq[Category]]]
    def create(category: Category): Future[Either[Errors, Category]]
    def retrieve(categoryId: String): Future[Either[Errors, Category]]
    def delete(categoryId: String): Future[Either[Errors, Category]]
  }

  trait DataSetCategoryService extends DbClientService {

    def getListWithDataSetId(dataSetId: String): Future[Either[Errors, Seq[DatasetCategory]]]
    def getListWithCategoryId(categoryId: String): Future[Either[Errors, Seq[DatasetCategory]]]
    def create(dataSetCategory: DatasetCategory): Future[Either[Errors, DatasetCategory]]
    def delete(dataSetId: String, categoryId: String): Future[Either[Errors, DatasetCategory]]
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
    def retrieve(locationId: Long): Future[Either[Errors, Location]]

  }


  trait ClusterService extends DbClientService {

    def list(): Future[Either[Errors, Seq[Cluster]]]
    def getLinkedClusters(
        datalakeId: Long): Future[Either[Errors, Seq[Cluster]]]

    def create(cluster: Cluster): Future[Either[Errors, Cluster]]
    def retrieve(clusterId: String): Future[Either[Errors, Cluster]]

  }

  // Maps to ClusterService
  trait ClusterComponentService extends DbClientService {

    def create(clusterService: ClusterData): Future[Either[Errors, ClusterData]]
    def getServiceByName(clusterId:Long,serviceName:String):Future[Either[Errors, ClusterData]]
    def getServicesByName(serviceName:String):Future[Either[Errors, Seq[ClusterData]]]
    def updateServiceByName(clusterData: ClusterData):Future[Either[Errors, Boolean]]

  }

  trait ClusterHostsService extends DbClientService {

    def getHostsByCluster(clusterId:Long):Future[Either[Errors,Seq[ClusterHost]]]
    def createOrUpdate(host:ClusterHost):Future[Option[Errors]]

  }


}
