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

import com.hortonworks.dataplane.commons.domain.Atlas.EntityDatasetRelationship
import com.hortonworks.dataplane.commons.domain.Entities._
import domain.API.AlreadyExistsError
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue
import slick.lifted.ColumnOrdered

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton
class DatasetRepo @Inject()(
                             protected val datasetCategoryRepo: DatasetCategoryRepo,
                             protected val categoryRepo: CategoryRepo,
                             protected val dataAssetRepo: DataAssetRepo,
                             protected val userRepo: UserRepo,
                             protected val clusterRepo: DpClusterRepo,
                             protected val dbConfigProvider: DatabaseConfigProvider)
  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._
  import PaginationSupport._

  val Datasets = TableQuery[DatasetsTable].filter(_.active)

  val DatasetsWritable = TableQuery[DatasetsTable]

  def all(): Future[List[Dataset]] = db.run {
    Datasets.to[List].result
  }

  def doSafeInsert(dataset: Dataset) = (
    Datasets.filter(_.name === dataset.name).exists.result.flatMap { exists =>
      if (!exists) {
        DatasetsWritable returning DatasetsWritable += dataset
      } else {
        DBIO.failed(new AlreadyExistsError()) // no-op
      }
    }
  )

  def count(search:Option[String]): Future[Int] = {
    val query = search
      .map(s => Datasets.filter(_.name.toLowerCase like s"%${s}%"))
        .getOrElse(Datasets)
    db.run(query.length.result)
  }

  def findById(datasetId: Long): Future[Option[Dataset]] = {
    db.run(Datasets.filter(_.id === datasetId).result.headOption)
  }

  def archiveById(datasetId: Long): Future[Int] = {
    db.run(Datasets.filter(_.id === datasetId).map(_.active).update(false))
  }

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
      savedDataset <- doSafeInsert(datasetCreateRequest.dataset)
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
        .join(clusterRepo.DataplaneClusters).on(_._1.dpClusterId === _.id)
    } yield (dataset, user.username, cluster.name, cluster.id)
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

  def sortByDataset(paginationQuery: Option[PaginatedQuery],
                    query: Query[(DatasetsTable, Rep[String], Rep[String], Rep[Option[Long]]), (Dataset, String, String, Option[Long]), Seq]) = {
    paginationQuery.map {
      pq =>
        val q = pq.sortQuery.map {
          sq =>
            query.sortBy {
              oq =>
                sq.sortCol match {
                  case "id" => oq._1.id
                  case "name" => oq._1.name
                  case "createdOn" => oq._1.createdOn
                  case "cluster" => oq._3
                  case "user" => oq._2
                }
            } (ColumnOrdered(_, sq.ordering))
        }.getOrElse(query)
        q.drop(pq.offset).take(pq.size)
    }.getOrElse(query)
  }

  private def getRichDataset(inputQuery: Query[DatasetsTable, Dataset, Seq],
                             paginatedQuery: Option[PaginatedQuery]): Future[Seq[RichDataset]] = {
    val query = for {
      datasetWithUsername <- sortByDataset(paginatedQuery, getDatasetWithNameQuery(inputQuery)).to[List].result
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
        val datasetWithAssetCountMap = result._2.groupBy(_._1.get).mapValues { e =>
          e.map {
            v => DataAssetCount(v._2, v._3)
          }
        }
        val datasetWithCategoriesMap = result._3.groupBy(_._1).mapValues(_.map(_._2))
        result._1.map {
          case (dataset, user, cluster, clusterId) =>
            RichDataset(
              dataset,
              datasetWithCategoriesMap.getOrElse(dataset.id.get, Nil),
              user,
              cluster,
              clusterId.get,
              datasetWithAssetCountMap.getOrElse(dataset.id.get, Nil)
            )
        }.toSeq
    }
  }

  implicit class NameSearchQuery(query: Query[DatasetsTable, Dataset, Seq]) {
    def search(searchText: Option[String]) = searchText
      .map(s => query.filter(_.name.toLowerCase like s"%${s.toLowerCase}%")).getOrElse(query)
  }

  def getRichDataset(searchText: Option[String], paginatedQuery: Option[PaginatedQuery] = None): Future[Seq[RichDataset]] = {
    getRichDataset(Datasets.search(searchText), paginatedQuery)
  }

  def getRichDatasetById(id: Long): Future[Option[RichDataset]] = {
    getRichDataset(Datasets.filter(_.id === id), None).map(_.headOption)
  }

  def getRichDatasetByTag(tagName: String, searchText: Option[String], paginatedQuery: Option[PaginatedQuery] = None): Future[Seq[RichDataset]] = {
    val query = categoryRepo.Categories.filter(_.name === tagName)
      .join(datasetCategoryRepo.DatasetCategories).on(_.id === _.categoryId)
      .join(Datasets).on(_._2.datasetId === _.id)
      .map(_._2)
    getRichDataset(query.search(searchText), paginatedQuery)
  }

  def insertWithCategories(datasetReq: DatasetAndCategoryIds): Future[DatasetAndCategories] = {
    val query = (for {
      dataset <- doSafeInsert(datasetReq.dataset)
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

  def getCategoriesCount(searchText: Option[String]): Future[List[CategoryCount]] = {
    val countQuery = datasetCategoryRepo.DatasetCategories.groupBy(_.categoryId).map {
      case (catId, results) => (catId -> results.length)
    }
    def countQueryWithFilter(st: String) = {
      ((datasetCategoryRepo.DatasetCategories.joinLeft(
        Datasets.filter(_.name.toLowerCase like s"%${st.toLowerCase()}%")
      ) on (_.datasetId === _.id)).groupBy(_._1.categoryId)).map{
        case(catId, results) => (catId -> results.map(_._2.map(_.name)).countDefined)
      }
    }

    val countQueryWithSearchOption = searchText.map(st => countQueryWithFilter(st)).getOrElse(countQuery)

    val statement = countQueryWithSearchOption.to[List].result.statements

    val query = for {
      ((catId, count), cat) <- countQueryWithSearchOption.join(categoryRepo.Categories).on(_._1 === _.id)
    } yield (cat.name, count)

    db.run(query.to[List].result).map {
      rows =>
        rows.map {
          case (name, count) =>
            CategoryCount(name, count)
        }.sortBy(_.name)
    }
  }


  def queryManagedAssets(clusterId: Long, assets: Seq[String]): Future[Seq[EntityDatasetRelationship]] = {
    val query = for {
      (dataAsset, dataset) <- dataAssetRepo.DatasetAssets.filter(record => record.guid.inSet(assets) /* && record.clusterId === clusterId */) join Datasets on (_.datasetId === _.id)
    } yield (dataAsset.guid, dataset.id, dataset.name)

    db.run(query.to[Seq].result).map {
      results =>
        results.map {
          case (guid, datasetId, datasetName) => EntityDatasetRelationship(guid, datasetId.get, datasetName)
        }
    }

  }


  final class DatasetsTable(tag: Tag)
    extends Table[Dataset](tag, Some("dataplane"), "datasets") with ColumnSelector {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[Option[String]]("description")

    def dpClusterId = column[Long]("dp_clusterid")

    def createdBy = column[Option[Long]]("createdby")

    def createdOn = column[LocalDateTime]("createdon")

    def lastmodified = column[LocalDateTime]("lastmodified")

    def active = column[Boolean]("active")

    def version = column[Int]("version")

    def customprops = column[Option[JsValue]]("custom_props")

    val select = Map("id" -> this.id, "name" -> this.name)

    def * =
      (id,
        name,
        description,
        dpClusterId,
        createdBy,
        createdOn,
        lastmodified,
        active,
        version,
        customprops
      ) <> ((Dataset.apply _).tupled, Dataset.unapply)

  }

}
