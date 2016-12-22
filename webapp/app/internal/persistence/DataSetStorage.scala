package internal.persistence

import com.hw.dp.service.cluster.DataModel.DataSet
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

trait DataSetStorage {

  def saveDataSet(dataSet: DataSet): Future[WriteResult]

  def deleteDataSet(name: String,cluster:String,host:String,datacenter:String): Future[WriteResult]

  def getDataSets(cluster:String,host:String,datacenter:String) : Future[Seq[DataSet]]

  def getDataSet(name: String,cluster:String,host:String,datacenter:String) : Future[Option[DataSet]]

}
