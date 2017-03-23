package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.DatasetCategory
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class DatasetCategoryRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val DatasetCategories = TableQuery[DatasetCategoriesTable]

  def insert(datasetCategory: DatasetCategory): Future[DatasetCategory] = {
    db.run {
      DatasetCategories returning DatasetCategories += datasetCategory
    }
  }

  def allWithCategoryId(categoryId: Long):Future[List[DatasetCategory]] = {
    db.run(DatasetCategories.filter(_.categoryId === categoryId).to[List].result)
  }

  def allWithDatasetId(datasetId: Long):Future[List[DatasetCategory]] = {
    db.run(DatasetCategories.filter(_.datasetId === datasetId).to[List].result)
  }

  def deleteById(categoryId: Long, datasetId: Long): Future[Int] = {
    db.run(DatasetCategories.filter( d => d.datasetId === datasetId && d.categoryId === categoryId).delete)
  }

  final class DatasetCategoriesTable(tag: Tag) extends Table[DatasetCategory](tag, Some("dataplane"), "dp_dataset_category") {

    def categoryId = column[Long]("category_id")
    def datasetId = column[Long]("dataset_id")

    def * = (categoryId, datasetId) <> ((DatasetCategory.apply _).tupled, DatasetCategory.unapply)
  }

}
