package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{DatasetCategory, UnclassifiedDatasetCategory}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class UnclassifiedDatasetCategoryRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val UnclassifiedDatasetCategories = TableQuery[UnclassifiedDatasetCategoriesTable]

  def insert(datasetCategory: UnclassifiedDatasetCategory): Future[UnclassifiedDatasetCategory] = {
    db.run {
      UnclassifiedDatasetCategories returning UnclassifiedDatasetCategories += datasetCategory
    }
  }

  def allWithCategoryId(categoryId: Long):Future[List[UnclassifiedDatasetCategory]] = {
    db.run(UnclassifiedDatasetCategories.filter(_.categoryId === categoryId).to[List].result)
  }

  def allWithDatasetId(datasetId: Long):Future[List[UnclassifiedDatasetCategory]] = {
    db.run(UnclassifiedDatasetCategories.filter(_.datasetId === datasetId).to[List].result)
  }

  def deleteById(categoryId: Long, datasetId: Long): Future[Int] = {
    db.run(UnclassifiedDatasetCategories.filter( d => d.datasetId === datasetId && d.categoryId === categoryId).delete)
  }

  final class UnclassifiedDatasetCategoriesTable(tag: Tag)
    extends Table[UnclassifiedDatasetCategory](tag, Some("dataplane"), "dataset_category") {

    def categoryId = column[Long]("category_id")
    def datasetId = column[Long]("unclassified_dataset_id")

    def * = (categoryId, datasetId) <> ((UnclassifiedDatasetCategory.apply _).tupled, UnclassifiedDatasetCategory.unapply)
  }

}
