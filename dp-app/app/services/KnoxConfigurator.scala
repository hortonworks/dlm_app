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

package services

import javax.inject.Singleton

import com.google.inject.Inject
import com.hortonworks.datapalane.consul.{ConsulClientFactory, DpConsulClientImpl}
import com.hortonworks.datapalane.consul.model.ConsulEvent
import com.typesafe.scalalogging.Logger

@Singleton
class KnoxConfigurator @Inject()(private val config: play.api.Configuration) {
  private val logger = Logger(classOf[KnoxConfigurator])
  private val dpConsulClient = ConsulClientFactory.getConsulClilent(
    config.getString("consul.host").getOrElse("localhost"),
    config.getInt("consul.port").getOrElse(8005)).asInstanceOf[DpConsulClientImpl]

  def configure() = {
    val event: ConsulEvent =
      new ConsulEvent("knoxSSoToplogyConfigured", null, null)
    val eventResp = dpConsulClient.fireEvent(event)
    logger.info(
      s"Fired knoxSsoTopolgyConfigured ConsulEvent id=(${eventResp.getId}) at time : ${eventResp.getlTime()}")
  }
}
