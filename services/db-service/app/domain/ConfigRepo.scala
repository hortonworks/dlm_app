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
  def update(dpConfig: DpConfig):Future[Int]={
    db.run (
      Configs.filter(_.configKey===dpConfig.configKey)
        .map(r=>(r.configValue,r.active,r.export))
        .update(dpConfig.configValue,dpConfig.active,dpConfig.export)
    )
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
