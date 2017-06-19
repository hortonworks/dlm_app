package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{DatasetTag, DatasetWithTag}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class DatasetTagRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val DatasetTags = TableQuery[DatasetTagsTable]
  val DatasetWithTags = TableQuery[DatasetWithTagsTable]


//  def insert(datasetTag: DatasetTag): Future[DatasetTag] = {
//    db.run {
//      DatasetTags returning DatasetTags += datasetTag
//    }
//  }
//
//  def all(categoryId: Long):Future[List[DatasetTag]] = {
//    db.run(DatasetTags.filter(_.categoryId === categoryId).to[List].result)
//  }

  def getTags(query: Option[String]): Future[List[DatasetTag]] = db.run {
    query match {
      case Some(query) => DatasetTags.filter(_.name.toLowerCase.startsWith(query.toLowerCase)).take(20).to[List].result
      case None => DatasetTags.to[List].result
    }
  }

  private class DatasetTagsTable(tag: Tag)
    extends Table[DatasetTag](tag, Some("dataplane"), "dp_dataset_tags") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def created = column[String]("created")

    def updated = column[String]("updated")

    def * =
      (id, name, created, updated) <> ((DatasetTag.apply _).tupled, DatasetTag.unapply)
  }

  final class DatasetWithTagsTable(datasetWithTag: DatasetWithTag) extends Table[DatasetWithTag](tag, Some("dataplane"), "dp_dataset_with_tags") {

    def tagId = column[Long]("tag_id")
    def datasetId = column[Long]("dataset_id")

    def * = (tagId, datasetId) <> ((DatasetWithTag.apply _).tupled, DatasetWithTag.unapply)
  }

}
