package internal.persistence

import com.google.inject.{Inject, Singleton}
import com.hw.dp.service.api.Service
import reactivemongo.api.MongoDriver

import scala.concurrent.duration._

@Singleton
class MongoDataStorage @Inject()(val mongoDriver: MongoDriver,configuration: play.api.Configuration) extends DataStorage{

  override def loadServices: Seq[Service] = List(Service("weather",false,Map(),1.minutes))

  override def loadService(service: Service): Option[Service] = ???

  override def addService(service: Service): Boolean = ???

  override def removeService(service: Service): Boolean = ???
}
