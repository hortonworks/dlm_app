package domain

import java.time.LocalDateTime
import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities._
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class DatasetRepo @Inject()(
                             protected val datasetCategoryRepo: DatasetCategoryRepo,
                             protected val categoryRepo: CategoryRepo,
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

  import scala.concurrent.ExecutionContext.Implicits.global

  def findByIdWithCategories(datasetId: Long): Future[Option[DatasetAndCategories]] = {
    val datasetQuery = Datasets.filter(_.id === datasetId)
    val categoriesQuery = for {
    datasetCategories <- datasetCategoryRepo.DatasetCategories if datasetCategories.datasetId === datasetId
    categories <- categoryRepo.Categories if categories.id === datasetCategories.categoryId
    } yield (categories)

    val query = for {
    dataset <- datasetQuery.result
    categories <- categoriesQuery.result
    } yield (dataset, categories)

    db.run(query).map {
      case (datasets, categories) =>
        datasets.headOption.map {
          dataset =>
            DatasetAndCategories(dataset, categories)
        }
    }
  }

  def insertWithCategories(datasetReq: DatasetAndCategoryIds) : Future[DatasetAndCategories] = {
    val query = (for{
      dataset <- Datasets returning Datasets += datasetReq.dataset
      _ <- datasetCategoryRepo.DatasetCategories ++=  datasetReq.categories.map(catId => DatasetCategory(catId,dataset.id.get))
      categories <- categoryRepo.Categories.filter(_.id.inSet(datasetReq.categories)).result
    } yield (DatasetAndCategories(dataset, categories))).transactionally

    db.run(query)
  }

  def updateWithCategories(datasetReq: DatasetAndCategoryIds) : Future[DatasetAndCategories] = {
    val query = (for{
      _ <- Datasets.filter(_.id === datasetReq.dataset.id).update(datasetReq.dataset)
      _ <- datasetCategoryRepo.DatasetCategories.filter(_.datasetId === datasetReq.dataset.id).delete
      _ <- datasetCategoryRepo.DatasetCategories ++=  datasetReq.categories.map(catId => DatasetCategory(catId,datasetReq.dataset.id.get))
      dataset <- Datasets.filter(_.id === datasetReq.dataset.id).result.head
      categories <- categoryRepo.Categories.filter(_.id.inSet(datasetReq.categories)).result
    } yield (DatasetAndCategories(dataset, categories))).transactionally

    db.run(query)
  }

  final class DatasetsTable(tag: Tag)
    extends Table[Dataset](tag, Some("dataplane"), "dp_datasets") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[Option[String]]("description")

    def datalakeId = column[Long]("datalakeid")

    def createdBy = column[Long]("createdby")

    def createdOn = column[LocalDateTime]("createdon")

    def lastmodified = column[LocalDateTime]("lastmodified")

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
