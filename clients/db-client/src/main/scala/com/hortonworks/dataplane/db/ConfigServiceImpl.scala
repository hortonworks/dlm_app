package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.DpConfig
import com.hortonworks.dataplane.db.Webserice.ConfigService
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.ws.{WSClient, WSResponse}
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.Future

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

  private def mapToConfig(res: WSResponse) = {
    res.status match {
      case 200 => (res.json \ "results").validate[DpConfig].asOpt
      case _ => None
    }
  }

}
