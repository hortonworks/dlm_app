/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, HJwtToken}
import com.hortonworks.dlm.webhdfs.WebService.FileService
import com.hortonworks.dlm.webhdfs.domain.Entities.WebHdfsApiError
import models.Entities.ClusterServiceEndpointDetails
import play.api.Logger
import play.api.libs.json.JsValue
import play.api.http.Status._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}

/**
  *
  * @param fileService         webhdfs service to execute hdfs file operations
  * @param dataplaneService    dataplane service to interact with dataplane db service
  */
@Singleton
class WebhdfsService @Inject()(
   @Named("fileService") val fileService: FileService,
   val dataplaneService: DataplaneService,
   val ambariService: AmbariService) {

  /**
    * 
    * @param clusterId    cluster id
    * @param queryString  query parameters with `path` and `operation` parameter
    * @return
    */
  def getFileOperationResult(clusterId: Long, queryString: Map[String, String])(implicit token:Option[HJwtToken]) : Future[Either[WebHdfsApiError, JsValue]] = {
    val p: Promise[Either[WebHdfsApiError, JsValue]] = Promise()
    val filePath = queryString.get(WebhdfsService.QUERY_PARAM_FILEPATH_KEY)
    filePath match {
      case None => p.success(Left(WebHdfsApiError(BAD_REQUEST, None, None,
        Some(WebhdfsService.pathErrorMsg))))
      case Some(path) => queryString.get(WebhdfsService.QUERY_PARAM_OPERATION_KEY) match {
        case None => p.success(Left(WebHdfsApiError(BAD_REQUEST, None, None,
          Some(WebhdfsService.operationErrorMsg))))
        case Some(operation) => {
          getActiveNameNodeEndpoint(clusterId).map {
            case Left(errors) => {
              val NAMENODE_ERROR_PREFIX = WebhdfsService.getNnErrorMsgPrefix
              p.success(Left(WebHdfsApiError(errors.errors.head.code.toInt, None, None,
                Some(NAMENODE_ERROR_PREFIX + errors.errors.head.message))))
            }
            case Right(endpointDetails) => {
              fileService.getFileOperationResult(endpointDetails.serviceProperties("url").get, path, operation).map{
                case Left(error) => p.success(Left(error))
                case Right(contentSummary) => p.success(Right(contentSummary))
              }
            }
          }  
        }
      }
    }
    p.future

  }


  def getActiveNameNodeEndpoint(clusterId: Long)(implicit token:Option[HJwtToken]) : Future[Either[Errors, ClusterServiceEndpointDetails]] = {
    val p: Promise[Either[Errors, ClusterServiceEndpointDetails]] = Promise()

    for {
      nameNodeDetails <- ambariService.getActiveComponent(clusterId)
      clusterServiceWithConfigs <- dataplaneService.getServiceConfigs(clusterId, DataplaneService.NAMENODE)
    } yield {
      val futureFailedList = List(nameNodeDetails, clusterServiceWithConfigs).filter(_.isLeft)
      if (futureFailedList.isEmpty) {
        val namenodeDetails = nameNodeDetails.right.get
        val namenodeName = namenodeDetails._1
        val isHAEnabled =  namenodeDetails._2
        dataplaneService.getNameNodeHttpEndpointDetails(clusterServiceWithConfigs.right.get, namenodeName, isHAEnabled) match {
          case Left(errors) => p.success(Left(errors))
          case Right(clusterServiceEndpointDetails) => p.success(Right(clusterServiceEndpointDetails))
        }
      } else {
        val errorMsg = WebhdfsService.getActiveNameNodeErrMsg
        Logger.error(errorMsg)
        p.success(Left(Errors(Seq(Error(BAD_GATEWAY.toString, errorMsg)))))
      }
    }
    p.future
  }
  
}

object WebhdfsService {
  lazy val QUERY_PARAM_FILEPATH_KEY = "path"
  lazy val QUERY_PARAM_OPERATION_KEY = "operation"
  lazy val SERVICE_NAME = "HDFS"

  def activeNnpredicate = "fields=host_components/metrics/dfs/FSNamesystem/HAState,host_components/HostRoles/host_name&minimal_response=true"
  def pathErrorMsg = "endpoint expects path parameter"
  def operationErrorMsg = "endpoint expects operation parameter"
  def getNnErrorMsgPrefix = "error getting namenode endpoint details from dataplane: "
  def getActiveNameNodeErrMsg = "Failed to get active namenode details"
}
