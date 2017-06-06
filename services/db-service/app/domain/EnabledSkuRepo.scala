package domain

import java.time.LocalDateTime
import javax.inject.Inject

import com.hortonworks.dataplane.commons.domain.Entities.EnabledSku
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

  final class EnabledSkusTable(tag: Tag) extends Table[(EnabledSku)](tag, Some("dataplane"), "enabled_skus") {
    def skuId = column[Long]("sku_id")

    def enabledBy = column[Long]("enabled_by")
    def enabledOn = column[Option[LocalDateTime]]("enabled_on")

    def smartSenseId = column[String]("smartsense_id")
    def subscriptionId = column[String]("subscription_id")

    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")

    def * = (skuId, enabledBy, enabledOn, smartSenseId, subscriptionId, created, updated) <>
      ((EnabledSku.apply _).tupled, EnabledSku.unapply)
  }


}