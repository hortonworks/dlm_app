package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.Ambari.ClusterServiceWithConfigs
import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasEntities, AtlasSearchQuery}
import play.api.libs.json.{JsResult, Json}
import play.api.libs.ws.WSResponse
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService => ClusterData}

import scala.concurrent.Future

object Webservice {

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

    def loadUserById(id: String): Future[Either[Errors, User]]

    def getUserRoles(userName: String): Future[Either[Errors, UserRoles]]

    def addUser(user: User): Future[Either[Errors, User]]

    def addRole(role: Role): Future[Either[Errors, Role]]

    def addUserRole(userRole: UserRole): Future[Either[Errors, UserRole]]

  }

  trait DataSetService extends DbClientService {

    def list(): Future[Either[Errors, Seq[Dataset]]]

    def create(dataSetAndCatIds: DatasetAndCategoryIds)
    : Future[Either[Errors, DatasetAndCategories]]

    def create(datasetReq: DatasetCreateRequest): Future[Either[Errors, DatasetAndCategories]]

    def listRichDataset(queryString : String): Future[Either[Errors, Seq[RichDataset]]]

    def getRichDatasetById(id: Long): Future[Either[Errors, RichDataset]]

    def listRichDatasetByTag(tagName: String, queryString : String): Future[Either[Errors, Seq[RichDataset]]]

    def getDataAssetByDatasetId(id: Long, queryName: String, offset: Long, limit: Long): Future[Either[Errors, Seq[DataAsset]]]

    def retrieve(dataSetId: String): Future[Either[Errors, DatasetAndCategories]]

    def update(dataSetAndCatIds: DatasetAndCategoryIds)
    : Future[Either[Errors, DatasetAndCategories]]

    def delete(dataSetId: String): Future[Either[Errors, Dataset]]
  }

  trait CategoryService extends DbClientService {

    def list(): Future[Either[Errors, Seq[Category]]]

    def search(searchText: String, size: Option[Long]): Future[Either[Errors, Seq[Category]]]

    def listWithCount(search:Option[String]): Future[Either[Errors, Seq[CategoryCount]]]

    def listWithCount(categoryName: String): Future[Either[Errors, CategoryCount]]

    def create(category: Category): Future[Either[Errors, Category]]

    def retrieve(categoryId: String): Future[Either[Errors, Category]]

    def delete(categoryId: String): Future[Either[Errors, Category]]
  }

  trait DataSetCategoryService extends DbClientService {

    def getListWithDataSetId(
                              dataSetId: String): Future[Either[Errors, Seq[DatasetCategory]]]

    def getListWithCategoryId(
                               categoryId: String): Future[Either[Errors, Seq[DatasetCategory]]]

    def create(dataSetCategory: DatasetCategory)
    : Future[Either[Errors, DatasetCategory]]

    def delete(dataSetId: String,
               categoryId: String): Future[Either[Errors, DatasetCategory]]
  }

  trait DpClusterService extends DbClientService {

    def list(): Future[Either[Errors, Seq[DataplaneCluster]]]

    def create(dpCluster: DataplaneCluster): Future[Either[Errors, DataplaneCluster]]

    def retrieve(dpClusterId: String): Future[Either[Errors, DataplaneCluster]]

    def update(dpClusterId: String,
               dpCluster: DataplaneCluster): Future[Either[Errors, DataplaneCluster]]

    def updateStatus(dpCluster: DataplaneCluster): Future[Either[Errors, Boolean]]

    def delete(dpClusterId: String): Future[Either[Errors, DataplaneCluster]]

  }

  trait LocationService extends DbClientService {

    def list(query: Option[String]): Future[Either[Errors, Seq[Location]]]

    def retrieve(locationId: Long): Future[Either[Errors, Location]]

  }

  trait ClusterService extends DbClientService {

    def list(): Future[Either[Errors, Seq[Cluster]]]

    def getLinkedClusters(dpClusterId: Long): Future[Either[Errors, Seq[Cluster]]]

    def create(cluster: Cluster): Future[Either[Errors, Cluster]]

    def retrieve(clusterId: String): Future[Either[Errors, Cluster]]

  }

  // Maps to ClusterService
  trait ClusterComponentService extends DbClientService {

    def create(
                clusterService: ClusterData): Future[Either[Errors, ClusterData]]

    def getServiceByName(
                          clusterId: Long,
                          serviceName: String): Future[Either[Errors, ClusterData]]

    def updateServiceByName(
                             clusterData: ClusterData): Future[Either[Errors, Boolean]]

    def addClusterHosts(clusterServiceHosts: Seq[ClusterServiceHost] = Seq())
    : Future[Seq[Either[Errors, ClusterServiceHost]]]

    def updateClusterHosts(
                            clusterServiceHosts: Seq[ClusterServiceHost] = Seq())
    : Future[Seq[Either[Errors, Boolean]]]

    def getEndpointsForCluster(
                                clusterId: Long,
                                service: String): Future[Either[Errors, ClusterServiceWithConfigs]]

    def getAllServiceEndpoints(serviceName: String): Future[Either[Errors, Seq[ClusterServiceWithConfigs]]]
  }

  trait ClusterHostsService extends DbClientService {
    def getHostByClusterAndName(
                                 clusterId: Long,
                                 hostName: String): Future[Either[Errors, ClusterHost]]

    def getHostsByCluster(
                           clusterId: Long): Future[Either[Errors, Seq[ClusterHost]]]

    def createOrUpdate(host: ClusterHost): Future[Option[Errors]]

  }

  trait ConfigService extends DbClientService {
    def getConfig(key: String): Future[Option[DpConfig]]
  }

  trait LdapConfigService extends DbClientService{

    def create(ldapConfig:LdapConfiguration): Future[Either[Errors, LdapConfiguration]]

    def get(): Future[Either[Errors, Seq[LdapConfiguration]]]

  }

  trait WorkspaceService extends DbClientService {
    def list(): Future[Either[Errors, Seq[WorkspaceDetails]]]

    def retrieve(name: String): Future[Either[Errors, WorkspaceDetails]]

    def create(workspace: Workspace): Future[Either[Errors, Workspace]]

    def delete(name: String): Future[Either[Errors, Int]]

  }

  trait AssetWorkspaceService extends DbClientService {
    def list(workspaceId: Long): Future[Either[Errors, Seq[DataAsset]]]

    def create(assetReq: AssetWorkspaceRequest): Future[Either[Errors, Seq[DataAsset]]]

    def delete(workspaceId: Long): Future[Either[Errors, Int]]
  }

  trait NotebookWorkspaceService extends DbClientService {
    def list(workspaceId: Long): Future[Either[Errors, Seq[NotebookWorkspace]]]

    def create(notebookWorkspace: NotebookWorkspace): Future[Either[Errors, NotebookWorkspace]]

    def delete(notebookId: String): Future[Either[Errors, Int]]
  }

}
