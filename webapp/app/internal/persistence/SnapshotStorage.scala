package internal.persistence

import com.hw.dp.service.api.Snapshot


trait SnapshotStorage {

  def storeSnapshot(snapshot: Snapshot)

  def clearSnapshot(snapshot: Snapshot)

  def loadLatestSnapShot()

}
