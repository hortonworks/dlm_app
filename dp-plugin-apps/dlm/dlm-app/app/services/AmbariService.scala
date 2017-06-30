package services

import javax.inject.{Inject, Singleton}

import com.google.inject.name.Named
import com.hortonworks.dataplane.cs.Webservice.{AmbariWebService => AmbariClientService}
import com.hortonworks.dataplane.commons.domain.Entities.{Errors, HJwtToken}
import play.api.libs.json.JsValue

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  *
  * @param ambariService         ambari service to execute ambari REST apis
  */
@Singleton
class AmbariService @Inject()(@Named("ambariService") val ambariService: AmbariClientService) {

  /**
    * Get hive databases using auto hive20 instance
    * @param clusterId cluster id
    * @return
    */
  def getHiveDatabases(clusterId: Long)(implicit token:Option[HJwtToken]) : Future[Either[Errors, JsValue]] = {
    val url = "/views/HIVE/versions/2.0.0/instances/AUTO_HIVE20_INSTANCE/resources/ddl/databases"
    ambariService.requestAmbariApi(clusterId, url)
  }

  /**
    * Get all tables for hive database using auto hive20 instance REST APIs
    * @param clusterId cluster id
    * @return
    */
  def getHiveDatabaseTables(clusterId: Long, dbName: String)(implicit token:Option[HJwtToken]) : Future[Either[Errors, JsValue]] = {
    val url = s"/views/HIVE/versions/2.0.0/instances/AUTO_HIVE20_INSTANCE/resources/ddl/databases/$dbName/tables"
    ambariService.requestAmbariApi(clusterId, url)
  }
}
