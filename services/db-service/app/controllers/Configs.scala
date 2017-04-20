package controllers

import javax.inject._

import domain.ConfigRepo
import play.api.mvc._

import scala.concurrent.ExecutionContext

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

}
