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

import com.hortonworks.dataplane.commons.metrics.{MetricsRegistry, MetricsReporter}
import domain.CategoryRepo
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Status @Inject()(categoryRepo: CategoryRepo,metricsRegistry: MetricsRegistry)(implicit exec: ExecutionContext)
    extends JsonAPI {

  def status = Action.async {
    Future.successful(Ok)
  }

  def metrics = Action.async {
    implicit val mr:MetricsRegistry = metricsRegistry
    Future.successful(Ok(MetricsReporter.asJson))
  }

  def health = Action.async {
    Future.successful(Ok)
  }



}
