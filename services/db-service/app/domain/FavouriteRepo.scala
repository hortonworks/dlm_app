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

import com.hortonworks.dataplane.commons.domain.Entities.Favourite
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class FavouriteRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Favourites = TableQuery[FavouritesTable]

  def add(userid: Long, datasetid: Long): Future[Favourite] ={
    val favourite = Favourite(userId = userid, datasetId = datasetid)
    db.run(Favourites returning Favourites += favourite)
  }

  def deleteById(userId: Long, favId: Long): Future[Int] = {
    db.run(Favourites.filter( t => (t.id === favId && t.userId === userId)).delete)
  }

  def deleteByDatasetId(datasetId: Long): Future[Int] = {
    db.run(Favourites.filter(_.datasetId === datasetId).delete)
  }

  def findByUserAndDatasetId(userId: Long, datasetId: Long): Future[Option[Long]] = {
    db.run(Favourites.filter( t => (t.userId === userId && t.datasetId === datasetId)).map(_.datasetId).result.headOption)
  }

  def getTotal(datasetId: Long) = {
    db.run(Favourites.filter(_.datasetId === datasetId).length.result)
  }

  final class FavouritesTable(tag: Tag) extends Table[Favourite](tag, Some("dataplane"), "favourites") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def userId = column[Long]("user_id")

    def datasetId = column[Long]("dataset_id")

    def * = (id, userId, datasetId) <> ((Favourite.apply _).tupled, Favourite.unapply)
  }

}
