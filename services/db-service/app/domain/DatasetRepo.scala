package domain

import java.time.LocalDateTime
import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Dataset}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class DatasetRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Datasets = TableQuery[DatasetsTable]

  def all(): Future[List[Dataset]] = db.run {
    Datasets.to[List].result
  }

  def insert(dataset: Dataset): Future[Dataset] = {
    db.run {
      Datasets returning Datasets += dataset
    }
  }

  def findById(datasetId: Long): Future[Option[Dataset]] = {
    db.run(Datasets.filter(_.id === datasetId).result.headOption)
  }

  def deleteById(datasetId: Long): Future[Int] = {
    db.run(Datasets.filter(_.id === datasetId).delete)
  }

  final class DatasetsTable(tag: Tag)
      extends Table[Dataset](tag, Some("dataplane"), "dp_datasets") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[Option[String]]("description")

    def datalakeId = column[Long]("datalakeid")

    def createdBy = column[Long]("createdby")

    def createdOn = column[Option[LocalDateTime]]("createdon")

    def lastmodified = column[Option[LocalDateTime]]("lastmodified")

    def version = column[Int]("version")

    def customprops = column[Option[JsValue]]("customprops")

    def * =
      (id,
       name,
       description,
       datalakeId,
       createdBy,
       createdOn,
       lastmodified,
       version,
       customprops
      ) <> ((Dataset.apply _).tupled, Dataset.unapply)

  }

}
