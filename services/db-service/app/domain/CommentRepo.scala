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

import java.sql.Date
import java.time.{LocalDate, LocalDateTime}
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{Comment, CommentWithUser}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton
class CommentRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider,
                            protected val userRepo: UserRepo) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Comments = TableQuery[CommentsTable]

  def add(comment: Comment): Future[CommentWithUser] = {
    val commentCopy = comment.copy(createdOn = Some(LocalDateTime.now()),lastModified = Some(LocalDateTime.now()),editVersion = Some(0))
    val query = (for {
      comnt <- Comments returning Comments += commentCopy
      user  <- userRepo.Users.filter(_.id === comnt.createdBy).result.head
    } yield(CommentWithUser(comnt,user.username))).transactionally

    db.run(query)
  }

  def findByObjectRef(objectId:Long, objectType:String, paginatedQuery: Option[PaginatedQuery] = None): Future[Seq[CommentWithUser]] = {
    implicit val localDateColumnType = MappedColumnType.base[LocalDate, Date](
      d => Date.valueOf(d),
      d => d.toLocalDate)
    val query = Comments.filter(m => (m.objectId === objectId && m.objectType === objectType))
      .join(userRepo.Users).on(_.createdBy === _.id).map(t => (t._1,t._2.username)).sortBy(_._1.createdOn)
    val q = paginatedQuery.map { pq =>
      query.drop(pq.offset).take(pq.size)
    }.getOrElse(query)
    db.run(q.result).map{res =>
      res.map{ r =>
        CommentWithUser(r._1,r._2)
      }
    }
  }

  def deleteById(commentId:Long, userId: Long)={
    db.run(Comments.filter(m =>(m.id === commentId && m.createdBy === userId)).delete)
  }

  def deleteByObjectRef(objectId:Long, objectType:String)={
    db.run(Comments.filter(m =>(m.objectId === objectId && m.objectType === objectType)).delete)
  }

  def update(commentText: String, commentId: Long) = {
    val query = (for {
      editVersion <- Comments.filter(_.id === commentId).map(t => t.editVersion).result.head
      _ <- Comments.filter(_.id === commentId).map(t => (t.comment,t.lastModified,t.editVersion)).update(Some(commentText),Some(LocalDateTime.now()), (editVersion ++ Some(1)).reduceLeftOption(_+_))
      commentWU: (Comment, String) <- Comments.filter(_.id === commentId).join(userRepo.Users).on(_.createdBy === _.id).map(t => (t._1, t._2.username)).result.head
    }yield (CommentWithUser(comment = commentWU._1, userName = commentWU._2))).transactionally

    db.run(query)
  }

  final class CommentsTable(tag: Tag) extends Table[Comment](tag, Some("dataplane"), "comments") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def comment = column[Option[String]]("comment")

    def objectType = column[String]("object_type")

    def objectId = column[Long]("object_id")

    def createdBy = column[Long]("createdby")

    def createdOn = column[Option[LocalDateTime]]("createdon")

    def lastModified = column[Option[LocalDateTime]]("lastmodified")

    def editVersion = column[Option[Int]]("edit_version")

    def * = (id, comment, objectType, objectId, createdBy, createdOn, lastModified, editVersion) <> ((Comment.apply _).tupled, Comment.unapply)
  }

}
