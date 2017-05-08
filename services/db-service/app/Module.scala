import java.time.Clock
import java.util.Optional
import javax.inject.Inject

import com.google.inject.AbstractModule
import com.hortonworks.datapalane.consul.{ApplicationRegistrar, ConsulHook, DpService, ZuulServer}
import play.api.{Configuration, Logger}


class Module extends AbstractModule {

  override def configure() = {
    // Use the system clock as the default implementation of Clock
    bind(classOf[Clock]).toInstance(Clock.systemDefaultZone)
    bind(classOf[ConsulInitializer]).asEagerSingleton()
  }

}

class ConsulInitializer @Inject()(config:Configuration){

  private val registrar = new ApplicationRegistrar(config.underlying,Optional.of(getHook))
  registrar.initialize()


  private def getHook = {
    new ConsulHook {

      override def onServiceRegistration(dpService: DpService) = Logger.info(s"Registered service $dpService")

      override def serviceRegistrationFailure(serviceId: String, th: Throwable) = Logger.warn(s"Service registration failed for $serviceId",th)

      override def onServiceDeRegister(serviceId: String): Unit = Logger.info(s"Service removed from consul $serviceId")

      override def onRecoverableException(reason: String, th: Throwable): Unit = Logger.warn(reason,th)

      override def gatewayDiscovered(zuulServer: ZuulServer): Unit = ???

      override def gatewayDiscoverFailure(message: String, th: Throwable): Unit = ???
    }
  }


}

