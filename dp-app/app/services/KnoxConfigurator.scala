package services

import javax.inject.Singleton

import com.google.inject.Inject
import com.hortonworks.datapalane.consul.ConsulClientFactory
import com.typesafe.scalalogging.Logger

@Singleton
class KnoxConfigurator @Inject()(private val config: play.api.Configuration) {
  private val logger = Logger(classOf[KnoxConfigurator])
  private val dpConsulClient = ConsulClientFactory.getConsulClilent(
    config.getString("consul.host").getOrElse("localhost"),
    config.getInt("consul.port").getOrElse(8005))

  def configure() = {
    val eventId=dpConsulClient.fireEvent("knoxSSoToplogyConfigured", null, null)
    logger.info(s"Fired knoxSsoTopolgyConfigured Event id=($eventId)")
  }
}
