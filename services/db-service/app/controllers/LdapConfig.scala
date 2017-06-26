package controllers

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.LdapConfiguration
import domain.LdapConfigRepo
import play.api.mvc.Action

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class LdapConfig @Inject()(ldapConfigRepo: LdapConfigRepo)(
    implicit exec: ExecutionContext)
    extends JsonAPI {
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  def add = Action.async(parse.json) { req =>
    req.body
      .validate[LdapConfiguration]
      .map { ldapConfiguration =>
        ldapConfigRepo
          .insert(ldapConfiguration)
          .map { lc =>
            success(lc)
          }
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }
  def getAll = Action.async { req =>
    ldapConfigRepo.all()
      .map{res=>
        success(res)
      }.recoverWith(apiError)
  }
}
