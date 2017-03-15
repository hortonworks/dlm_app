package models

import com.hortonworks.dataplane.commons.service.cluster.DataModel.{DataFilter, DataSet}
import play.api.libs.json.Json

object Filters {

  import com.hortonworks.dataplane.commons.service.cluster.Formatters._
  import models.Filters._

  case class SearchQuery(clusterHost:String,dataCenter:String,predicates: Seq[DataFilter] = Seq())


  implicit val searchQueryReads = Json.reads[SearchQuery]

  implicit val searchQueryWrites = Json.writes[SearchQuery]

}

