package com.hw.dp.service.cluster

object DataModel {

  case class DataSet(clusterName: String,
                     ambariHost: String,
                     dataCenter: String,
                     name: String,
                     category:String,
                     description: String,
                     hiveFilters: Seq[DataFilter],
                     hBaseFilters :Seq[DataFilter],
                     fileFilters:Seq[DataFilter],
                     properties: Map[String, String])
  // for Hive
  //path - field/column
  case class DataFilter(predicate: String, qualifier: String = "field",path:String)

}
