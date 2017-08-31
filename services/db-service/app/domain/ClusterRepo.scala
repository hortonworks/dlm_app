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

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.Future

@Singleton
class ClusterRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Clusters = TableQuery[ClustersTable]

  def all(dpClusterId: Option[Long]): Future[List[Cluster]] = db.run {
    dpClusterId match {
      case Some(dpClusterId) =>
        Clusters.filter(_.dpClusterid === dpClusterId).to[List].result
      case None => Clusters.to[List].result
    }
  }

  def insert(cluster: Cluster): Future[Cluster] = {
    val security = if (cluster.secured.isEmpty) {
      Some(false)
    } else cluster.secured
    cluster.copy(secured = security)
    db.run {
      Clusters returning Clusters += cluster
    }
  }

  def findById(clusterId: Long): Future[Option[Cluster]] = {
    db.run(Clusters.filter(_.id === clusterId).result.headOption)
  }

  def findByDpClusterId(dpClusterId: Long): Future[List[Cluster]] = {

    db.run(Clusters.filter(_.dpClusterid === dpClusterId).to[List].result)
  }

  def deleteById(clusterId: Long): Future[Int] = {
    db.run(Clusters.filter(_.id === clusterId).delete)
  }

  final class ClustersTable(tag: Tag)
      extends Table[Cluster](tag, Some("dataplane"), "discovered_clusters") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def ambariurl = column[Option[String]]("cluster_url")

    def secured = column[Option[Boolean]]("secured")

    def kerberosuser = column[Option[String]]("kerberos_user")

    def kerberosticketLocation =
      column[Option[String]]("kerberos_ticket_location")

    def dpClusterid = column[Option[Long]]("dp_clusterid")

    def userid = column[Option[Long]]("user_id")

    def properties = column[Option[JsValue]]("properties")

    def * =
      (id,
       name,
       ambariurl,
       secured,
       kerberosuser,
       kerberosticketLocation,
       dpClusterid,
       userid,
       properties) <> ((Cluster.apply _).tupled, Cluster.unapply)

  }

}
