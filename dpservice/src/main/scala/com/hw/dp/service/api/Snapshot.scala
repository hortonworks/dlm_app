package com.hw.dp.service.api

import com.hw.dp.service.cluster.{Ambari, ServiceComponent}

import scala.concurrent.duration.Duration

/**
  * A snapshot is data returned by the service, at a certain time
  */
case class Snapshot(snapshotId:String, snapshotTimeStamp:Long, data:SnapshotData,serviceComponent: ServiceComponent,ambari: Ambari)


/**
  * SnapshotData is json returned from the service run
  * Each snapshot is persisted till the persistence policy expires
  * @param json
  */
final case class SnapshotData(json:Option[String])

/**
  * How much time to keep the snapshot
  * @param keepFor
  */
final case class PersistencePolicy(keepFor:Duration)

sealed case class Ok()
sealed case class Fail()



