package com.hw.dp.service.cluster

import java.util.Date

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
                     userName:Option[String] = None,
                     lastModified:Date = new Date())
  // for Hive
  //path - field/column/column_attribute
  case class DataFilter(predicate: String, qualifier: String = "field")

}
