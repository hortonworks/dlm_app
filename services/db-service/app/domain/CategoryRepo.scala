package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{Category}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class CategoryRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Categories = TableQuery[CategoriesTable]

  def all(): Future[List[Category]] = db.run {
    Categories.to[List].result
  }

  def insert(category: Category): Future[Category] = {
    db.run {
      Categories returning Categories += category
    }
  }

  def deleteById(categoryId: Long): Future[Int] = {
    val Category = db.run(Categories.filter(_.id === categoryId).delete)
    Category
  }

  def findByName(name: String): Future[Option[Category]] = {
    db.run(Categories.filter(_.name === name).result.headOption)
  }

  def searchByName(searchText: String, size: Long): Future[List[Category]] = {
    db.run(Categories.filter(_.name.toLowerCase like s"%${searchText.toLowerCase}%").take(size).to[List].result)
  }

  def findById(categoryId: Long): Future[Option[Category]] = {
    db.run(Categories.filter(_.id === categoryId).result.headOption)
  }

  final class CategoriesTable(tag: Tag) extends Table[Category](tag, Some("dataplane"), "categories") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def description = column[String]("description")

    def created = column[Option[LocalDateTime]]("created")

    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id, name, description, created, updated) <> ((Category.apply _).tupled, Category.unapply)
  }

}
