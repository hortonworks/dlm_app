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

import com.hortonworks.dataplane.commons.domain.Entities.ClusterHost
import play.api.Logger
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.json.JsValue

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class ClusterHostRepo @Inject()(
    protected val dbConfigProvider: DatabaseConfigProvider)
    extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val ClusterHosts = TableQuery[ClusterHostTable]

  def allWithCluster(clusterId: Long): Future[List[ClusterHost]] = db.run {
    ClusterHosts.filter(_.clusterId === clusterId).to[List].result
  }

  def insert(clusterHost: ClusterHost): Future[ClusterHost] = {
    db.run {
      ClusterHosts returning ClusterHosts += clusterHost
    }
  }

  def upsert(clusterHost: ClusterHost): Future[Int] = {

    db.run(
        ClusterHosts
          .filter(_.clusterId === clusterHost.clusterId)
          .filter(_.host === clusterHost.host)
          .map(r => (r.status, r.properties))
          .update(clusterHost.status, clusterHost.properties))
      .map {
        case 0 =>
          db.run(ClusterHosts += clusterHost)
          1
        case 1 => 1
        case _ => throw new Exception("Too many rows updated")
      }
      .recoverWith {
        case e: Exception =>
          Logger.error("Could not insert host info")
          Future.successful(0)
      }
  }

  def findByHostAndCluster(clusterId:Long,hostName:String) = {
    db.run(
      ClusterHosts
        .filter(c => c.clusterId === clusterId && c.host === hostName)
        .result
        .headOption)
  }

  def findByClusterAndHostId(clusterId: Long,
                             hostId: Long): Future[Option[ClusterHost]] = {
    db.run(
      ClusterHosts
        .filter(c => c.clusterId === clusterId && c.id === hostId)
        .result
        .headOption)
  }

  def deleteById(clusterId: Long, id: Long): Future[Int] = {
    db.run(
      ClusterHosts
        .filter(c => c.clusterId === clusterId && c.id === id)
        .delete)
  }

  final class ClusterHostTable(tag: Tag)
      extends Table[ClusterHost](tag, Some("dataplane"), "cluster_hosts") {

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def host = column[String]("host")

    def ipaddr = column[String]("ipaddr")

    def status = column[String]("status")

    def properties = column[Option[JsValue]]("properties")

    def clusterId = column[Long]("cluster_id")

    def * =
      (id, host,ipaddr,status, properties, clusterId) <> ((ClusterHost.apply _).tupled, ClusterHost.unapply)
  }

}
