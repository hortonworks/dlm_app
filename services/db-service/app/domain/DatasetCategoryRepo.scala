package domain

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{CategoryCount, DatasetCategory}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class DatasetCategoryRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider,
                                    protected val categoryRepo: CategoryRepo
                                   ) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._
  import scala.concurrent.ExecutionContext.Implicits.global

  val DatasetCategories = TableQuery[DatasetCategoriesTable]

  def insert(datasetCategory: DatasetCategory): Future[DatasetCategory] = {
    db.run {
      DatasetCategories returning DatasetCategories += datasetCategory
    }
  }

  def getCategoriesCount(): Future[List[CategoryCount]] = {
    val countQuery = DatasetCategories.groupBy(_.categoryId).map {
      case (catId, results) => (catId -> results.length)
    }

    val query = for {
      ((catId, count), cat) <- countQuery.join(categoryRepo.Categories).on(_._1 === _.id)
    } yield (cat.name, count)

    db.run(query.to[List].result).map {
      rows =>
        rows.map {
          case (name, count) =>
            CategoryCount(name, count)
        }.sortBy(_.name)
    }
  }

  def getCategoryCount(categoryName: String): Future[CategoryCount] = {
    val query = (categoryRepo.Categories.filter(_.name === categoryName)
      .join(DatasetCategories).on(_.id === _.categoryId)).length

    db.run(query.result).map {
      count =>
       CategoryCount(categoryName, count)
    }
  }

  def allWithCategoryId(categoryId: Long): Future[List[DatasetCategory]] = {
    db.run(DatasetCategories.filter(_.categoryId === categoryId).to[List].result)
  }

  def allWithDatasetId(datasetId: Long): Future[List[DatasetCategory]] = {
    db.run(DatasetCategories.filter(_.datasetId === datasetId).to[List].result)
  }

  def deleteById(categoryId: Long, datasetId: Long): Future[Int] = {
    db.run(DatasetCategories.filter(d => d.datasetId === datasetId && d.categoryId === categoryId).delete)
  }

  final class DatasetCategoriesTable(tag: Tag) extends Table[DatasetCategory](tag, Some("dataplane"), "dp_dataset_categories") {

    def categoryId = column[Long]("category_id")

    def datasetId = column[Long]("dataset_id")

    def * = (categoryId, datasetId) <> ((DatasetCategory.apply _).tupled, DatasetCategory.unapply)
  }

}
