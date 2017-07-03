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
