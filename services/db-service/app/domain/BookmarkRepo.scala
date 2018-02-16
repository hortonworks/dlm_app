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

import com.hortonworks.dataplane.commons.domain.Entities.Bookmark
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future

@Singleton
class BookmarkRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Bookmarks = TableQuery[BookmarksTable]

  def add(userid: Long, objectId: Long, objectType: String): Future[Bookmark] ={
    val bookmark = Bookmark(userId = userid, objectType = objectType,objectId = objectId)
    db.run(Bookmarks returning Bookmarks += bookmark)
  }

  def deleteById(userId: Long, bmId: Long): Future[Int] = {
    db.run(Bookmarks.filter(t => (t.id === bmId && t.userId === userId)).delete)
  }

  def deleteByobjectRef(objectId: Long, objectType: String): Future[Int] = {
    db.run(Bookmarks.filter(t => (t.objectId === objectId && t.objectType === objectType)).delete)
  }

  final class BookmarksTable(tag: Tag) extends Table[Bookmark](tag, Some("dataplane"), "bookmarks") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def userId = column[Long]("user_id")

    def objectType = column[String]("object_type")

    def objectId = column[Long]("object_id")

    def * = (id, userId, objectType, objectId) <> ((Bookmark.apply _).tupled, Bookmark.unapply)
  }

}
