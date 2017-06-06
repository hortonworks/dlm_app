package domain

import java.time.LocalDateTime
import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{Dataset, UnclassifiedDataset}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class UnclassifiedDatasetRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val UnclassifiedDatasets = TableQuery[UnclassifiedDatasetsTable]

  def all(): Future[List[UnclassifiedDataset]] = db.run {
    UnclassifiedDatasets.to[List].result
  }

  def insert(dataset: UnclassifiedDataset): Future[UnclassifiedDataset] = {
    db.run {
      UnclassifiedDatasets returning UnclassifiedDatasets += dataset
    }
  }

  def findById(datasetId: Long): Future[Option[UnclassifiedDataset]] = {
    db.run(UnclassifiedDatasets.filter(_.id === datasetId).result.headOption)
  }

  def deleteById(datasetId: Long): Future[Int] = {
    db.run(UnclassifiedDatasets.filter(_.id === datasetId).delete)
  }

  final class UnclassifiedDatasetsTable(tag: Tag)
      extends Table[UnclassifiedDataset](tag, Some("dataplane"), "unclassified_datasets") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[Option[String]]("description")

    def dpClusterId = column[Long]("dp_clusterid")

    def createdBy = column[Long]("createdby")

    def createdOn = column[Option[LocalDateTime]]("createdon")

    def lastmodified = column[Option[LocalDateTime]]("lastmodified")

    def customprops = column[Option[JsValue]]("custom_props")

    def * =
      (id,
       name,
       description,
       dpClusterId,
       createdBy,
       createdOn,
       lastmodified,
       customprops
      ) <> ((UnclassifiedDataset.apply _).tupled, UnclassifiedDataset.unapply)

  }

}
