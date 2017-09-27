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
  def update= Action.async(parse.json) {req =>
    req.body.validate[LdapConfiguration]
      .map{ldapConfiguration =>
        ldapConfigRepo.update(ldapConfiguration)
          .map{resp=>
            if (resp){
              success(resp)
            }else{
              Conflict
            }
          }
      }.getOrElse{
        Future.successful(BadRequest)
     }
  }

  def getAll = Action.async { req =>
    ldapConfigRepo.all()
      .map{res=>
        success(res)
      }.recoverWith(apiError)
  }
}
