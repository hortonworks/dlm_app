package domain

import java.time.LocalDateTime
import javax.inject.Inject

import domain.Entities.EnabledSku
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

class EnabledSkuRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider)
  extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val EnabledSkus = TableQuery[EnabledSkusTable]

  def all(): Future[List[EnabledSku]] = db.run {
    EnabledSkus.to[List].result
  }

  def insert(skuId: Long, enabledBy: Long, smartSenseId: String, subscriptionId: String): Future[EnabledSku] = {
    val enabledSku = EnabledSku(skuId = skuId, enabledBy = enabledBy,
      smartSenseId = smartSenseId, subscriptionId = subscriptionId)
    db.run {
      EnabledSkus returning EnabledSkus += enabledSku
    }
  }

  def findById(skuId: Long):Future[Option[EnabledSku]] = {
    db.run(EnabledSkus.filter(_.skuId === skuId).result.headOption)
  }

  def deleteById(skuId: Long): Future[Int] = {
    db.run(EnabledSkus.filter(_.skuId === skuId).delete)
  }

  final class EnabledSkusTable(tag: Tag) extends Table[(EnabledSku)](tag, Some("dataplane"), "dp_enabled_skus") {
    def skuId = column[Long]("sku_id")

    def enabledBy = column[Long]("enabledby")
    def enabledOn = column[Option[LocalDateTime]]("enabledon")

    def smartSenseId = column[String]("smartsenseid")
    def subscriptionId = column[String]("subscriptionid")

    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")

    def * = (skuId, enabledBy, enabledOn, smartSenseId, subscriptionId, created, updated) <>
      ((EnabledSku.apply _).tupled, EnabledSku.unapply)
  }


}