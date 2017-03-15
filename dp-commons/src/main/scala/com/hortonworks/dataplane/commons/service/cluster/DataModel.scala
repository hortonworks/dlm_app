package com.hortonworks.dataplane.commons.service.cluster

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
                     lastModified:Option[Date] = Some(new Date()),
                     created:Option[Date] = Some(new Date()))

  object DataSet {
    def withUser(dataSet: DataSet,user:String) = DataSet(dataSet.ambariHost,dataSet.dataCenter,dataSet.name,
      dataSet.category,dataSet.description,dataSet.permissions,dataSet.hiveFilters,dataSet.hBaseFilters,dataSet.fileFilters,dataSet.properties,Some(user))
  }

  // for Hive
  //path - field/column/column_attribute
  case class DataFilter(predicate: String, qualifier: String = "field")

}
