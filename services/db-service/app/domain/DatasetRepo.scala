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
                             protected val dataAssetRepo: DataAssetRepo,
                             protected val userRepo: UserRepo,
                             protected val clusterRepo: ClusterRepo,
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

  def count(): Future[Int] = {
    db.run(Datasets.length.result)
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

  def create(datasetCreateRequest: DatasetCreateRequest) = {
    val tags = datasetCreateRequest.tags
    val query = for {
      existingCategories <- categoryRepo.Categories.filter(_.name.inSet(tags)).to[List].result
      _ <- {
        val catNames = existingCategories.map(_.name)
        categoryRepo.Categories ++= tags.filter(t => !catNames.contains(t)).map(t => Category(None, t, t))
      }
      savedDataset <- Datasets returning Datasets += datasetCreateRequest.dataset
      categories <- categoryRepo.Categories.filter(_.name.inSet(tags)).to[List].result
      _ <- datasetCategoryRepo.DatasetCategories ++= categories.map(c => DatasetCategory(c.id.get, savedDataset.id.get))
      _ <- dataAssetRepo.DatasetAssets ++= datasetCreateRequest.dataAssets.map(a => a.copy(datasetId = Some(savedDataset.id.get)))
    } yield (DatasetAndCategories(savedDataset, categories))

    db.run(query.transactionally)
  }

  private def getDatasetWithNameQuery(inputQuery: Query[DatasetsTable, Dataset, Seq]) = {
    for {
      ((dataset, user), cluster) <-
      (inputQuery.join(userRepo.Users).on(_.createdBy === _.id))
        .join(clusterRepo.Clusters).on(_._1.dpClusterId === _.id)
    } yield (dataset, user.username, cluster.name)
  }

  private def getDatasetAssetCount(datasetIds: Seq[Long]) = {
    for {
      ((datasetId, assetType), result) <- dataAssetRepo.DatasetAssets.filter(_.datasetId.inSet(datasetIds))
        .groupBy(a => (a.datasetId, a.assetType))
    } yield (datasetId, assetType, result.length)
  }

  private def getDatasetCategories(datasetIds: Seq[Long]) = {
    for {
      (datasetCategory, category) <- datasetCategoryRepo.DatasetCategories.filter(_.datasetId.inSet(datasetIds))
        .join(categoryRepo.Categories).on(_.categoryId === _.id)
    } yield (datasetCategory.datasetId, category.name)
  }

  private def getRichDataset(inputQuery: Query[DatasetsTable, Dataset, Seq]): Future[Seq[RichDataset]] = {
    val query = for {
      datasetWithUsername <- getDatasetWithNameQuery(inputQuery).to[List].result
      datasetAssetCount <- {
        val datasetIds = datasetWithUsername.map(_._1.id.get)
        getDatasetAssetCount(datasetIds).to[List].result
      }
      datasetCategories <- {
        val datasetIds = datasetWithUsername.map(_._1.id.get)
        getDatasetCategories(datasetIds).to[List].result
      }
    } yield (datasetWithUsername, datasetAssetCount, datasetCategories)

    db.run(query).map {
      result =>
        val datasetWithUsernameMap = result._1.groupBy(_._1.id.get).mapValues(_.head)
        val datasetWithAssetCountMap = result._2.groupBy(_._1.get).mapValues { e =>
          e.map {
            v => DataAssetCount(v._2, v._3)
          }
        }
        val datasetWithCategoriesMap = result._3.groupBy(_._1).mapValues(_.map(_._2))
        datasetWithUsernameMap.map {
          case (id, (dataset, user, cluster)) =>
            RichDataset(
              dataset,
              datasetWithCategoriesMap.getOrElse(id, Nil),
              user,
              cluster,
              datasetWithAssetCountMap.getOrElse(id, Nil)
            )
        }.toSeq
    }
  }

  def getRichDataset(): Future[Seq[RichDataset]] = {
    getRichDataset(Datasets)
  }

  def getRichDatasetByTag(tagName: String): Future[Seq[RichDataset]] = {
    val query = categoryRepo.Categories.filter(_.name === tagName)
      .join(datasetCategoryRepo.DatasetCategories).on(_.id === _.categoryId)
      .join(Datasets).on(_._2.datasetId === _.id)
      .map(_._2)
    getRichDataset(query)
  }

  def insertWithCategories(datasetReq: DatasetAndCategoryIds): Future[DatasetAndCategories] = {
    val query = (for {
      dataset <- Datasets returning Datasets += datasetReq.dataset
      _ <- datasetCategoryRepo.DatasetCategories ++= datasetReq.categories.map(catId => DatasetCategory(catId, dataset.id.get))
      categories <- categoryRepo.Categories.filter(_.id.inSet(datasetReq.categories)).result
    } yield (DatasetAndCategories(dataset, categories))).transactionally

    db.run(query)
  }

  def updateWithCategories(datasetReq: DatasetAndCategoryIds): Future[DatasetAndCategories] = {
    val query = (for {
      _ <- Datasets.filter(_.id === datasetReq.dataset.id).update(datasetReq.dataset)
      _ <- datasetCategoryRepo.DatasetCategories.filter(_.datasetId === datasetReq.dataset.id).delete
      _ <- datasetCategoryRepo.DatasetCategories ++= datasetReq.categories.map(catId => DatasetCategory(catId, datasetReq.dataset.id.get))
      dataset <- Datasets.filter(_.id === datasetReq.dataset.id).result.head
      categories <- categoryRepo.Categories.filter(_.id.inSet(datasetReq.categories)).result
    } yield (DatasetAndCategories(dataset, categories))).transactionally

    db.run(query)
  }

  final class DatasetsTable(tag: Tag)
    extends Table[Dataset](tag, Some("dataplane"), "datasets") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[Option[String]]("description")

    def dpClusterId = column[Long]("dp_clusterid")

    def createdBy = column[Option[Long]]("createdby")

    def createdOn = column[LocalDateTime]("createdon")

    def lastmodified = column[LocalDateTime]("lastmodified")

    def version = column[Int]("version")

    def customprops = column[Option[JsValue]]("custom_props")

    def * =
      (id,
        name,
        description,
        dpClusterId,
        createdBy,
        createdOn,
        lastmodified,
        version,
        customprops
      ) <> ((Dataset.apply _).tupled, Dataset.unapply)

  }

}
