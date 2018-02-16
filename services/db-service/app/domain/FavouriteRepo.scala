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

  def add(userid: Long, objectId: Long, objectType: String): Future[Favourite] ={
    val favourite = Favourite(userId = userid, objectType = objectType,objectId = objectId)
    db.run(Favourites returning Favourites += favourite)
  }

  def deleteById(userId: Long, favId: Long): Future[Int] = {
    db.run(Favourites.filter( t => (t.id === favId && t.userId === userId)).delete)
  }

  def deleteByobjectRef(objectId: Long, objectType: String): Future[Int] = {
    db.run(Favourites.filter(t => (t.objectId === objectId && t.objectType === objectType)).delete)
  }

  def getTotal(objectId: Long, objectType: String) = {
    db.run(Favourites.filter(t => (t.objectId === objectId && t.objectType === objectType)).length.result)
  }

  final class FavouritesTable(tag: Tag) extends Table[Favourite](tag, Some("dataplane"), "favourites") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def userId = column[Long]("user_id")

    def objectType = column[String]("object_type")

    def objectId = column[Long]("object_id")

    def * = (id, userId, objectType, objectId) <> ((Favourite.apply _).tupled, Favourite.unapply)
  }

}
