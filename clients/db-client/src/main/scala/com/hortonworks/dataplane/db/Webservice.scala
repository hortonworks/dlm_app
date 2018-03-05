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

package com.hortonworks.dataplane.db

import com.google.common.base.Strings
import com.hortonworks.dataplane.commons.domain.Entities.{ClusterService => ClusterData, _}
import com.hortonworks.dataplane.commons.domain.Ambari.ClusterServiceWithConfigs
import com.hortonworks.dataplane.commons.domain.Atlas.{AtlasAttribute, AtlasEntities, AtlasSearchQuery, EntityDatasetRelationship}
import play.api.Logger
import play.api.libs.json.{JsObject, JsResult, JsSuccess, Json}
import play.api.libs.ws.WSResponse

import scala.concurrent.Future
import scala.util.{Success, Try}

object Webservice {

  trait DbClientService {

    import com.hortonworks.dataplane.commons.domain.JsonFormatters._

    protected  def createEmptyErrorResponse = {
      Left(Error(status=404, message = "No response from server"))
    }
    
    protected def extractEntity[T](res: WSResponse,
                                   f: WSResponse => T): Either[Error, T] = {
      Right(f(res))
    }

    protected def extractError(res: WSResponse,
                               f: WSResponse => JsResult[Error]): Error = {
      if (res.body.isEmpty)
        Error(500, "Unknown error", "database.client.generic")
      else f(res).map(r => r).getOrElse(Error(500, "Unknown error", "database.client.generic"))
    }

    protected def mapError(res: WSResponse) = {
      Left(extractError(res, r => r.json.validate[Error]))
    }

    protected def mapResponseToError(res: WSResponse, loggerMsg: Option[String]= None) = {
      val errorsObj = Try(res.json.validate[Error])

      errorsObj match {
        case Success(e :JsSuccess[Error]) =>
          printLogs(res,loggerMsg)
          throw new WrappedErrorException(e.get)
        case _ =>
          val msg = if(Strings.isNullOrEmpty(res.body)) res.statusText else  res.body
          val logMsg = loggerMsg.map { lmsg =>
            s"""$lmsg | $msg""".stripMargin
          }.getOrElse(s"In db-client: Failed with $msg")
          printLogs(res,Option(logMsg))
          throw new WrappedErrorException(Error(res.status, msg, code = "database.generic"))
      }
    }

    private def printLogs(res: WSResponse,msg: Option[String]) ={
      val logMsg = msg.getOrElse(s"Could not get expected response status from service. Response status ${res.statusText}")
      Logger.warn(logMsg)
    }
  }

  trait UserService extends DbClientService {

    def loadUser(username: String): Future[Either[Error, User]]

    def loadUserById(id: String): Future[Either[Error, User]]

    def getUserRoles(userName: String): Future[Either[Error, UserRoles]]

    def addUser(user: User): Future[Either[Error, User]]

    def updateUser(user: User): Future[Either[Error, User]]

    def addRole(role: Role): Future[Either[Error, Role]]

    def addUserRole(userRole: UserRole): Future[Either[Error, UserRole]]

    def getUsers(): Future[Either[Error,Seq[User]]]

    def getUsersWithRoles(offset: Option[String], pageSize: Option[String], searchTerm: Option[String]): Future[Either[Error,UsersList]]

    def getRoles():  Future[Either[Error,Seq[Role]]]

    def addUserWithRoles(userInfo: UserInfo): Future[Either[Error, UserInfo]]

    def getUserDetail(userName:String): Future[Either[Error,UserInfo]]

    def updateActiveAndRoles(userInfo: UserInfo): Future[Either[Error,Boolean]]

    def addUserWithGroups(userGroupInfo: UserGroupInfo): Future[Either[Error,UserGroupInfo]]
    def updateUserWithGroups(userLdapGroups: UserLdapGroups): Future[Either[Error,UserContext]]
    def getUserContext(userName:String): Future[Either[Error,UserContext]]

  }

  trait GroupService extends DbClientService {

    def getGroups(offset: Option[String], pageSize: Option[String], searchTerm: Option[String]): Future[Either[Error, GroupsList]]

    def getAllActiveGroups(): Future[Either[Error,Seq[Group]]]

    def addGroupWithRoles(groupInfo: GroupInfo): Future[Either[Error,GroupInfo]]

    def updateGroupInfo(groupInfo: GroupInfo): Future[Either[Error,Boolean]]

    def getGroupByName(groupName: String): Future[Either[Error,GroupInfo]]

    def getRolesForGroups(groupIds:Seq[Long]): Future[Either[Error,Seq[String]]]
  }

  trait DataSetService extends DbClientService {

    def list(name: Option[String]): Future[Either[Error, Seq[Dataset]]]

    def create(dataSetAndTags: DatasetAndTags): Future[RichDataset]

    def create(datasetReq: DatasetCreateRequest): Future[Either[Error, DatasetAndCategories]]

    def update(dataSetAndTags: DatasetAndTags): Future[RichDataset]

    def addAssets(id: Long, dataAssets: Seq[DataAsset]) : Future[RichDataset]

    def removeAssets(datasetId: Long, queryString: String) : Future[RichDataset]

    def removeAllAssets(id: Long) : Future[RichDataset]

    def listRichDataset(queryString : String,userId:Long): Future[Either[Error, Seq[RichDataset]]]

    def getRichDatasetById(id: Long,userId:Long): Future[Either[Error, RichDataset]]

    def listRichDatasetByTag(tagName: String, queryString : String,userId:Long): Future[Either[Error, Seq[RichDataset]]]

    def getDataAssetByDatasetId(id: Long, queryName: String, offset: Long, limit: Long): Future[Either[Error, AssetsAndCounts]]

    def retrieve(dataSetId: String): Future[Either[Error, DatasetAndCategories]]

    def updateDataset(datasetId : String, dataset: Dataset): Future[Dataset]

    def delete(dataSetId: String): Future[Either[Error, Long]]
  }

  trait CategoryService extends DbClientService {

    def list(): Future[Either[Error, Seq[Category]]]

    def search(searchText: String, size: Option[Long]): Future[Either[Error, Seq[Category]]]

    def listWithCount(search:Option[String], userId: Long): Future[Either[Error, Seq[CategoryCount]]]

    def listWithCount(categoryName: String): Future[Either[Error, CategoryCount]]

    def create(category: Category): Future[Either[Error, Category]]

    def retrieve(categoryId: String): Future[Either[Error, Category]]

    def delete(categoryId: String): Future[Either[Error, Category]]
  }

  trait DataSetCategoryService extends DbClientService {

    def getListWithDataSetId(
                              dataSetId: String): Future[Either[Error, Seq[DatasetCategory]]]

    def getListWithCategoryId(
                               categoryId: String): Future[Either[Error, Seq[DatasetCategory]]]

    def create(dataSetCategory: DatasetCategory)
    : Future[Either[Error, DatasetCategory]]

    def delete(dataSetId: String,
               categoryId: String): Future[Either[Error, DatasetCategory]]
  }

  trait DpClusterService extends DbClientService {

    def list(): Future[Either[Error, Seq[DataplaneCluster]]]

    def create(dpCluster: DataplaneCluster): Future[Either[Error, DataplaneCluster]]

    def retrieve(dpClusterId: String): Future[Either[Error, DataplaneCluster]]

    def retrieveServiceInfo(dpClusterId: String): Future[Either[Error, Seq[ClusterData]]]

    def checkExistenceByUrl(ambariUrl: String): Future[Either[Error, Boolean]]

    def update(dpClusterId: String,
               dpCluster: DataplaneCluster): Future[Either[Error, DataplaneCluster]]

    def update(dpCluster: DataplaneCluster): Future[Either[Error, DataplaneCluster]]


    def updateStatus(dpCluster: DataplaneCluster): Future[Either[Error, Boolean]]

    def delete(dpClusterId: String): Future[Either[Error, Boolean]]

  }

  trait LocationService extends DbClientService {

    def list(query: Option[String]): Future[Either[Error, Seq[Location]]]

    def retrieve(locationId: Long): Future[Either[Error, Location]]

  }

  trait CommentService extends DbClientService {

    def add(comment: Comment): Future[CommentWithUser]

    def getByObjectRef(queryString: String): Future[Seq[CommentWithUser]]

    def deleteById(commentId: String,userId: Long): Future[String]

    def update(commentText: String, commentId: String): Future[CommentWithUser]

    def deleteByObjectRef(objectId: String, objectType: String): Future[String]

    def getByParentId(parentId: String, queryString: String): Future[Seq[CommentWithUser]]

    def getCommentsCount(objectId: Long, objectType: String): Future[JsObject]

  }

  trait RatingService extends DbClientService {

    def add(rating: Rating): Future[Rating]

    def get(queryString: String, userId: Long): Future[Rating]

    def getAverage(queryString: String): Future[JsObject]

    def update(ratingId: String, ratingUserTuple: (Float, Long)): Future[Rating]

    def deleteByObjectRef(objectId: String, objectType: String): Future[String]

  }

  trait FavouriteService extends DbClientService {

    def add(favourite: Favourite): Future[FavouriteWithTotal]

    def deleteById(userId: Long,id: Long,objectId: Long, objectType: String): Future[JsObject]

  }

  trait BookmarkService extends DbClientService {

    def add(bookmark: Bookmark): Future[Bookmark]

    def deleteById(userId: Long, bmId:Long): Future[JsObject]

  }

  trait ClusterService extends DbClientService {

    def list(): Future[Either[Error, Seq[Cluster]]]

    def getLinkedClusters(dpClusterId: Long): Future[Either[Error, Seq[Cluster]]]

    def create(cluster: Cluster): Future[Either[Error, Cluster]]

    def retrieve(clusterId: String): Future[Either[Error, Cluster]]

  }

  // Maps to ClusterService
  trait ClusterComponentService extends DbClientService {

    def create(
                clusterService: ClusterData): Future[Either[Error, ClusterData]]

    def getServiceByName(
                          clusterId: Long,
                          serviceName: String): Future[Either[Error, ClusterData]]

    def updateServiceByName(
                             clusterData: ClusterData): Future[Either[Error, Boolean]]

    def addClusterHosts(clusterServiceHosts: Seq[ClusterServiceHost] = Seq())
    : Future[Seq[Either[Error, ClusterServiceHost]]]

    def updateClusterHosts(
                            clusterServiceHosts: Seq[ClusterServiceHost] = Seq())
    : Future[Seq[Either[Error, Boolean]]]

    def getEndpointsForCluster(
                                clusterId: Long,
                                service: String): Future[Either[Error, ClusterServiceWithConfigs]]

    def getAllServiceEndpoints(serviceName: String): Future[Either[Error, Seq[ClusterServiceWithConfigs]]]
  }

  trait ClusterHostsService extends DbClientService {
    def getHostByClusterAndName(
                                 clusterId: Long,
                                 hostName: String): Future[Either[Error, ClusterHost]]

    def getHostsByCluster(
                           clusterId: Long): Future[Either[Error, Seq[ClusterHost]]]

    def createOrUpdate(host: ClusterHost): Future[Option[Error]]

  }

  trait ConfigService extends DbClientService {

    def getConfig(key: String): Future[Option[DpConfig]]

    def addConfig(dpConfig: DpConfig): Future[Either[Error, DpConfig]]

    def setConfig(key: String,value:String): Future[Either[Error, DpConfig]]

  }

  trait LdapConfigService extends DbClientService{

    def create(ldapConfig:LdapConfiguration): Future[Either[Error, LdapConfiguration]]

    def get(): Future[Either[Error, Seq[LdapConfiguration]]]

    def update(ldapConfig: LdapConfiguration): Future[Either[Error, Boolean]]

  }

  trait DataAssetService extends DbClientService {
    def findManagedAssets(clusterId:Long, assets: Seq[String]): Future[Either[Error, Seq[EntityDatasetRelationship]]]
    def findAssetByGuid(guid: String): Future[Either[Error, DataAsset]]
  }
  trait SkuService extends  DbClientService {
    def getAllSkus():Future[Either[Error,Seq[Sku]]]
    def getSku(name:String): Future[Either[Error,Sku]]
    def getEnabledSkus():Future[Either[Error,Seq[EnabledSku]]]
    def enableSku(enabledSku: EnabledSku):Future[Either[Error,EnabledSku]]
  }
}
