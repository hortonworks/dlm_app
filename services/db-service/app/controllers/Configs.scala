package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.DpConfig
import domain.ConfigRepo
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Configs @Inject()(configRepo: ConfigRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def get(key: String) = Action.async {
    configRepo.findByKey(key).map { uo =>
      uo.map { u =>
        success(u)
      }
        .getOrElse(notFound)
    }.recoverWith(apiError)
  }

  def add() = Action.async(parse.json) { request =>
    request.body.validate[DpConfig].map { dpConfig =>
      configRepo.insert(dpConfig).map {
        config => success(config)
      }.recoverWith(apiError)
    }.getOrElse(Future.successful(BadRequest))
  }
}
