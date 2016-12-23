package internal.persistence

import com.hw.dp.service.cluster.DataModel.DataSet
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

trait DataSetStorage {

  def saveDataSet(dataSet: DataSet): Future[WriteResult]

  def updateDataSet(dataSet: DataSet): Future[WriteResult]

  def deleteDataSet(name: String,host:String,datacenter:String): Future[WriteResult]

  def getDataSets(host:String,datacenter:String) : Future[Seq[DataSet]]

  def getDataSet(name: String,host:String,dataCenter:String) : Future[Option[DataSet]]

}
