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
  def addOrUpdate() = Action.async(parse.json) {request =>
    request.body.validate[DpConfig].map { dpConfig =>
      configRepo.findByKey(dpConfig.configKey).flatMap {
        case Some(conf) => {
          val dpConfigObj = DpConfig(id = conf.id, configKey = dpConfig.configKey, configValue = dpConfig.configValue, active = dpConfig.active, export = conf.export)
          configRepo.update(dpConfigObj).map { res =>
            success(dpConfigObj)
          }.recoverWith(apiError)
          Future.successful(success(conf))
        }
        case None => {
          val dpConfigObj = DpConfig(id = None, configKey = dpConfig.configKey, configValue = dpConfig.configValue, active = Some(true), export = Some(true))
          configRepo.insert(dpConfigObj).map {config =>
             success(config)
          }.recoverWith(apiError)
        }
      }.recoverWith(apiError)
    }.getOrElse(Future.successful(BadRequest))
  }
}
