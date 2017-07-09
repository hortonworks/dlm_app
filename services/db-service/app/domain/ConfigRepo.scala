package domain

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{DpConfig}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ConfigRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider)(implicit ec: ExecutionContext) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Configs = TableQuery[Configtable]

  def insert(dpConfig: DpConfig): Future[DpConfig] = {
    db.run {
      Configs returning Configs += dpConfig
    }
  }

  def findByKey(key: String): Future[Option[DpConfig]] = {
    db.run(Configs.filter(_.configKey === key).result.headOption)
  }


  final class Configtable(tag: Tag) extends Table[DpConfig](tag, Some("dataplane"), "configs") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def configKey = column[String]("config_key")

    def configValue = column[String]("config_value")

    def active = column[Option[Boolean]]("active")

    def export = column[Option[Boolean]]("export")

    def * = (id, configKey, configValue, active, export) <> ((DpConfig.apply _).tupled, DpConfig.unapply)
  }

}
