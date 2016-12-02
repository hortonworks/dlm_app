package com.hw.dp.service.api

import scala.concurrent.duration.Duration

/**
  * A snapshot is data returned by the service, at a certain time
  * The snapshots may be
  * @param snapshotId
  * @param snapshotTimeStamp
  * @param data
  */
case class Snapshot(snapshotId:String, snapshotTimeStamp:Long, data:SnapshotData,serviceName:String)


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



