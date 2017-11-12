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

import java.util.Collections
import javax.inject._

import com.hortonworks.dataplane.commons.metrics.{MetricsRegistry, MetricsReporter}
import domain.CategoryRepo
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Status @Inject()(categoryRepo: CategoryRepo, metricsRegistry: MetricsRegistry)(implicit exec: ExecutionContext)
  extends JsonAPI {

  def status = Action.async {
    Future.successful(Ok)
  }

  import scala.collection.JavaConverters._

  def metrics = Action.async { req =>
    implicit val mr: MetricsRegistry = metricsRegistry
    val params = req.queryString.get(MetricsReporter.prometheusNameParam).map(_.toSet.asJava).getOrElse(Collections.emptySet())
    val exported = req.queryString.get(MetricsReporter.exportParam).getOrElse(Seq())
    if (!exported.isEmpty && exported.head == MetricsReporter.prometheus) {
      Future.successful(Ok(MetricsReporter.asPrometheusTextExport(params)))
    } else
      Future.successful(Ok(MetricsReporter.asJson))
  }


  def health = Action.async {
    Future.successful(Ok)
  }


}
