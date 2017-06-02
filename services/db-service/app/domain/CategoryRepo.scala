package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{DatasetTag}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class CategoryRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Categories = TableQuery[CategoriesTable]

  def all(): Future[List[DatasetTag]] = db.run {
    Categories.to[List].result
  }

  def insert(category: DatasetTag): Future[DatasetTag] = {
    db.run {
      Categories returning Categories += category
    }
  }

  def deleteById(categoryId: Long): Future[Int] = {
    val Category = db.run(Categories.filter(_.id === categoryId).delete)
    Category
  }

  def findByName(name: String):Future[Option[DatasetTag]] = {
      db.run(Categories.filter(_.name === name).result.headOption)
  }

  def findById(categoryId: Long):Future[Option[DatasetTag]] = {
    db.run(Categories.filter(_.id === categoryId).result.headOption)
  }

  final class CategoriesTable(tag: Tag) extends Table[DatasetTag](tag, Some("dataplane"), "dp_categories") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id,name,created,updated) <> ((DatasetTag.apply _).tupled, DatasetTag.unapply)
  }

}
