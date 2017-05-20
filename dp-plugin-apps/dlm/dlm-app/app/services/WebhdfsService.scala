package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dlm.webhdfs.WebService.FileService
import com.hortonworks.dlm.webhdfs.domain.Entities.{ContentSummary, WebHdfsApiError}
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
   val dataplaneService: DataplaneService) {

  /**
    * 
    * @param clusterId    cluster id
    * @param queryString  query parameters with `path` and `operation` parameter
    * @return
    */
  def getFileOperationResult(clusterId: Long, queryString: Map[String, String]) : Future[Either[WebHdfsApiError, JsValue]] = {
    val p: Promise[Either[WebHdfsApiError, JsValue]] = Promise()
    val filePath = queryString.get(WebhdfsService.QUERY_PARAM_FILEPATH_KEY)
    filePath match {
      case None => p.success(Left(WebHdfsApiError(BAD_REQUEST, None, None,
        Some(WebhdfsService.pathErrorMsg))))
      case Some(path) => queryString.get(WebhdfsService.QUERY_PARAM_OPERATION_KEY) match {
        case None => p.success(Left(WebHdfsApiError(BAD_REQUEST, None, None,
          Some(WebhdfsService.operationErrorMsg))))
        case Some(operation) => {
          dataplaneService.getNameNodeHttpService(clusterId).map {
            case Left(errors) => {
              val NAMENODE_ERROR_PREFIX = WebhdfsService.getNnErrorMsgPrefix
              p.success(Left(WebHdfsApiError(errors.errors.head.code.toInt, None, None,
                Some(NAMENODE_ERROR_PREFIX + errors.errors.head.message))))
            }
            case Right(endpointDetails) => {
              fileService.getFileOperationResult(endpointDetails.fullURL, path, operation).map{
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
  
}

object WebhdfsService {
  lazy val QUERY_PARAM_FILEPATH_KEY = "path"
  lazy val QUERY_PARAM_OPERATION_KEY = "operation"

  def pathErrorMsg = "endpoint expects path parameter"
  def operationErrorMsg = "endpoint expects operation parameter"
  def getNnErrorMsgPrefix = "error getting namenode endpoint details from dataplane: "
}
