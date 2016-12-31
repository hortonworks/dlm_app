package com.hw.dp.service.cluster

object DataModel {

  case class DataSet(ambariHost: String,
                     dataCenter: String,
                     name: String,
                     category:String,
                     description: String,
                     permissions:String,
                     hiveFilters: Seq[DataFilter],
                     hBaseFilters :Seq[DataFilter],
                     fileFilters:Seq[DataFilter],
                     properties: Map[String, String],
                     userName:Option[String] = None)
  // for Hive
  //path - field/column/column_attribute
  case class DataFilter(predicate: String, qualifier: String = "field")

}
