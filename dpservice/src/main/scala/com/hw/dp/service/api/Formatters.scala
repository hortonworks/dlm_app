package com.hw.dp.service.api

import play.api.libs.json.{JsPath, Reads}
import play.api.libs.functional.syntax._



object Formatters {


    import play.api.libs.json.Json
//
//    implicit val snapShotFormat = Json.format[Snapshot]
//
//    implicit val snapShotReads: Reads[Snapshot] = (
//        (JsPath \ "snapshotId").read[String] and
//        (JsPath \ "snapshotTimeStamp").read[String] and
//        (JsPath \ "data").read[SnapshotData] and
//        (JsPath \ "serviceName").read[String]
//      ) (Snapshot.apply _)
//
//    implicit val snapShotReads: Reads[SnapshotData] = (
//      (JsPath \ "snapshotId").read[String] and
//        (JsPath \ "snapshotTimeStamp").read[String] and
//        (JsPath \ "data").read[SnapshotData] and
//        (JsPath \ "serviceName").read[String]
//      ) (Snapshot.apply _)
//


}
