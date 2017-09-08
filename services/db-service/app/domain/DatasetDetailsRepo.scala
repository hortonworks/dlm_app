/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package domain

import java.time.LocalDateTime
import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{Dataset, DatasetDetails}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class DatasetDetailsRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val DatasetDetailsTable = TableQuery[DatasetDetailsTable]

  def allWithDatasetId(datasetId:Long): Future[List[DatasetDetails]] = db.run {
    DatasetDetailsTable.filter(_.datasetId === datasetId).to[List].result
  }

  def insert(datasetDetails: DatasetDetails): Future[DatasetDetails] = {
    db.run {
      DatasetDetailsTable returning DatasetDetailsTable += datasetDetails
    }
  }

  def findById(id: Long): Future[Option[DatasetDetails]] = {
    db.run(DatasetDetailsTable.filter(_.id === id).result.headOption)
  }

  def deleteById(id: Long): Future[Int] = {
    db.run(DatasetDetailsTable.filter(_.id === id).delete)
  }

  final class DatasetDetailsTable(tag: Tag)
      extends Table[DatasetDetails](tag, Some("dataplane"), "dataset_details") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def details = column[Option[JsValue]]("details")

    def datasetId = column[Long]("dataset_id")

    def * =
      (id,
       details,
       datasetId
      ) <> ((DatasetDetails.apply _).tupled, DatasetDetails.unapply)

  }

}
