package internal.persistence

import akka.actor.Actor
import com.google.inject.Inject
import com.hw.dp.service.api.{SaveSnapshot, Snapshot}


class SnapshotPersister @Inject()(storage:SnapshotStorage) extends Actor{

  override def receive: Receive = {

    case SaveSnapshot(snapshot:Snapshot) => {
      println(snapshot)
    }

  }

}


