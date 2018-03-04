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

import com.hortonworks.dataplane.commons.domain.Entities.{Dataset, DatasetEditDetails}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class DatasetEditDetailsRepo @Inject()(
                                        protected val dbConfigProvider: DatabaseConfigProvider
                                      )
  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Table = TableQuery[DatasetEditDetailsTable]


  final class DatasetEditDetailsTable(tag: Tag)
    extends Table[DatasetEditDetails](tag, Some("dataplane"), "dataset_edit_details") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def datasetId = column[Long]("dataset_id")

    def editorId = column[Long]("edited_by")

    def editBegin = column[Option[LocalDateTime]]("edit_begin")

    def * =
      (id,
        datasetId,
        editorId,
        editBegin
      ) <> ((DatasetEditDetails.apply _).tupled, DatasetEditDetails.unapply)

  }

}
