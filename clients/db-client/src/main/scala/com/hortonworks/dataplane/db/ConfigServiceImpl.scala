package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities.{DpConfig, Errors}
import com.hortonworks.dataplane.db.Webservice.ConfigService
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class ConfigServiceImpl(config: Config)(implicit ws: WSClient)
    extends ConfigService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  val logger = Logger(classOf[ConfigServiceImpl])

  override def getConfig(key: String): Future[Option[DpConfig]] = {
    ws.url(s"$url/configurations/$key")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToConfig)
      .recoverWith {
        case e: Exception =>
          logger.error(
            s"Error while loading config key $key, will return none",e)
          Future.successful(None)
      }
  }

  override def addConfig(dpConfig: DpConfig): Future[Either[Errors, DpConfig]] = {
    ws.url(s"$url/configurations")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(dpConfig))
      .map(mapToConfigWithError)
  }
  override def setConfig(key: String,value:String): Future[Either[Errors, DpConfig]] = {
    val dpConfig=DpConfig(id=None,configKey = key,configValue = value) //Note if configkey is not present it will insert.
    ws.url(s"$url/configurations")
      .withHeaders("Accept" -> "application/json")
      .put(Json.toJson(dpConfig))
      .map(mapToConfigWithError)
  }

  private def mapToConfig(res: WSResponse) = {
    res.status match {
      case 200 => (res.json \ "results").validate[DpConfig].asOpt
      case _ => None
    }
  }

  private def mapToConfigWithError(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[DpConfig].get)
      case _ => mapErrors(res)
    }
  }

}
