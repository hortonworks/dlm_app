package models

import com.hw.dp.service.cluster.{Host, NameNode, Service}
import play.api.libs.json.Json

/**
  * Wrapper for all API responses
  */
case class DataCenterDetail(hosts:Seq[Host], nameNodeInfo:List[NameNode], loadAvg:Double, numClusters:Int)


object ResponseFormatters {

  import com.hw.dp.service.cluster.Formatters._

  implicit val dataCenterDetailWrites = Json.writes[DataCenterDetail]

  implicit val dataCenterDetailReads = Json.reads[DataCenterDetail]
}
