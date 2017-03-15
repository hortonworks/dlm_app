package domain

import java.time.LocalDateTime
import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.Sku
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class SkuRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Skus = TableQuery[SkusTable]

  def all(): Future[List[Sku]] = db.run {
    Skus.to[List].result
  }

  def insert(name: String, description: String): Future[Sku] = {
    val sku = Sku(name = name, description = description, status = Option(0))
    db.run {
      Skus returning Skus += sku
    }
  }

  def findById(skuId: Long):Future[Option[Sku]] = {
    db.run(Skus.filter(_.id === skuId).result.headOption)
  }

  def deleteById(skuId: Long): Future[Int] = {
    db.run(Skus.filter(_.id === skuId).delete)
  }

  final class SkusTable(tag: Tag) extends Table[Sku](tag, Some("dataplane"), "dp_skus") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")
    def description = column[String]("description")
    def status = column[Option[Short]]("status")

    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id, name, description, status, created, updated) <> ((Sku.apply _).tupled, Sku.unapply)
  }

}
