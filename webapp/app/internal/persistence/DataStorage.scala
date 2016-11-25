package internal.persistence

import com.hw.dp.service.api.Service


trait DataStorage {

  def loadServices:Seq[Service]

  def loadService(service: Service):Option[Service]

  def addService(service: Service):Boolean

  def removeService(service: Service):Boolean

}
