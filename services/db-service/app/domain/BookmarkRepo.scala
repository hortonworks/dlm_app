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

  def add(userid: Long, datasetid: Long): Future[Bookmark] ={
    val bookmark = Bookmark(userId = userid, datasetId = datasetid)
    db.run(Bookmarks returning Bookmarks += bookmark)
  }

  def deleteById(userId: Long, bmId: Long): Future[Int] = {
    db.run(Bookmarks.filter(t => (t.id === bmId && t.userId === userId)).delete)
  }

  def deleteByDatasetId(datasetId: Long): Future[Int] = {
    db.run(Bookmarks.filter(_.datasetId === datasetId).delete)
  }

  def findByUserAndDatasetId(userId: Long, datasetId: Long): Future[Option[Long]] = {
    db.run(Bookmarks.filter( t => (t.userId === userId && t.datasetId === datasetId)).map(_.datasetId).result.headOption)
  }

  final class BookmarksTable(tag: Tag) extends Table[Bookmark](tag, Some("dataplane"), "bookmarks") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def userId = column[Long]("user_id")

    def datasetId = column[Long]("dataset_id")

    def * = (id, userId, datasetId) <> ((Bookmark.apply _).tupled, Bookmark.unapply)
  }

}
