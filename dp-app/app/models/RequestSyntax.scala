package models

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Datalake}
import play.api.libs.json.Json
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

object RequestSyntax {
  case class RegisterLake(lake: Datalake, cluster: Cluster)
  /*
  {
    "name":"my ds name",
    "description":"some description",
    "lakeId":3,
    "tags":["tag-1","tag-2","tag-new"],
    "query":{
      "filters":  [{
        "attribute":"asset.source",
        "attributeType": "string",
        "operator":"=",
        "operand":"hive"
      },{
        "attribute":"asset.name",
        "attributeType": "string",
        "operator":"contains",
        "operand":"searchText"
     }]
    }
  }
   */
  case class DataAssetQueryFilter(attribute: String, attributeType: String, operator: String, operand: String)
  case class DataAssetQuery(filters: Option[Seq[DataAssetQueryFilter]])
  case class CreateDataset(name: String, description: String, lakeId: Long, tags: Option[Seq[String]], query: DataAssetQuery)
}

object Formatters {
  import models.RequestSyntax._

  implicit val registerLakeWrites = Json.writes[RegisterLake]
  implicit val registerLakeReads = Json.reads[RegisterLake]

  implicit val dataAssetQueryFilterWrites = Json.writes[DataAssetQueryFilter]
  implicit val dataAssetQueryFilterReads = Json.reads[DataAssetQueryFilter]

  implicit val dataAssetQueryWrites = Json.writes[DataAssetQuery]
  implicit val dataAssetQueryReads = Json.reads[DataAssetQuery]

  implicit val createDatasetWrites = Json.writes[CreateDataset]
  implicit val createDatasetReads = Json.reads[CreateDataset]

}
