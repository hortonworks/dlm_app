package internal.persistence

import com.google.inject.{Inject, Singleton}
import com.hortonworks.dataplane.commons.service.cluster.DataModel.DataSet
import reactivemongo.api.MongoDriver
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

@Singleton
class MongoDataSetStorage @Inject()(configuration: play.api.Configuration)
  extends DataSetStorage {

  def getConfig(key: String): String = {
    configuration.underlying.getString(key)
  }

  override def saveDataSet(dataSet: DataSet): Future[WriteResult] = ???

  override def updateDataSet(dataSet: DataSet): Future[WriteResult] = ???

  override def deleteDataSet(name: String,
                             host: String,
                             dataCenter: String): Future[WriteResult] = ???

  override def getDataSets(host: String,
                           dataCenter: String): Future[Seq[DataSet]] = ???

  override def getDataSet(name: String,
                          host: String,
                          dataCenter: String): Future[Option[DataSet]] = ???
}
