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
  implicit val localDateColumnType = MappedColumnType.base[LocalDate, Date](
    d => Date.valueOf(d),
    d => d.toLocalDate)

  def add(comment: Comment): Future[CommentWithUser] = {
    val commentCopy = comment.copy(createdOn = Some(LocalDateTime.now()),lastModified = Some(LocalDateTime.now()),numberOfReplies = Some(0),editVersion = Some(0))
    val query =  commentCopy.parentCommentId match {
      case Some(id) => addReplyCommentQuery(commentCopy)
      case None => addCommentQuery(commentCopy)
    }
    db.run(query)
  }

  private def addCommentQuery(comment: Comment) = {
    (for {
      comnt <-  Comments returning Comments += comment
      user  <- userRepo.Users.filter(_.id === comnt.createdBy).result.head
    } yield(CommentWithUser(comnt,user.username))).transactionally
  }

  private def addReplyCommentQuery(comment: Comment) = {
    (for {
      comnt <-  Comments returning Comments += comment
      numOfReplies <- Comments.filter(m => (m.id === comnt.parentCommentId)).map(t => t.numberOfReplies).result.head
      _ <- Comments.filter(_.id === comnt.parentCommentId).map(t => t.numberOfReplies).update(Some(numOfReplies.get + 1))
      user  <- userRepo.Users.filter(_.id === comnt.createdBy).result.head
    } yield(CommentWithUser(comnt,user.username))).transactionally
  }

  def findByObjectRef(objectId:Long, objectType:String, paginatedQuery: Option[PaginatedQuery] = None): Future[Seq[CommentWithUser]] = {
    val query = Comments.filter(m => (m.objectId === objectId && m.objectType === objectType && m.parentCommentId.isEmpty))
      .join(userRepo.Users).on(_.createdBy === _.id).map(t => (t._1,t._2.username)).sortBy(_._1.createdOn)
    makeResult(query,paginatedQuery)
  }

  private def makeResult(query: Query[(Any, Rep[String]), (Comment, String), Seq], paginatedQuery: Option[PaginatedQuery]) ={
    val q = paginatedQuery.map { pq =>
      query.drop(pq.offset).take(pq.size)
    }.getOrElse(query)
    db.run(q.result).map{res =>
      res.map{ r =>
        CommentWithUser(r._1,r._2)
      }
    }
  }
  def findByParentId(parentId: Long) ={
    val query = Comments.filter(m => (m.parentCommentId === parentId))
      .join(userRepo.Users).on(_.createdBy === _.id).map(t => (t._1,t._2.username)).sortBy(_._1.createdOn)
    makeResult(query, None)
  }

  def deleteCommentById(commentId:Long, userId: Long)={
    db.run(Comments.filter(m =>(m.id === commentId && m.createdBy === userId)).delete)
  }

  def deleteReplyCommentById(commentId:Long, userId: Long, parentId: Long)={
    val query = (for {
      numDel <- Comments.filter(m =>(m.id === commentId && m.createdBy === userId)).delete
      numOfReplies <-  Comments.filter(m => (m.id === parentId)).map(t => t.numberOfReplies).result.head
      _ <- Comments.filter(_.id === parentId).map(t => t.numberOfReplies).update(Some(numOfReplies.get - 1))
    } yield(numDel)).transactionally
    db.run(query)
  }

  def getById(commentId: Long, userId: Long): Future[Comment] = {
    db.run(Comments.filter(m =>(m.id === commentId)).result.head)
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

    def parentCommentId = column[Option[Long]]("parent_comment_id")

    def numberOfReplies = column[Option[Long]]("number_of_replies")

    def editVersion = column[Option[Int]]("edit_version")

    def * = (id, comment, objectType, objectId, createdBy, createdOn, lastModified, parentCommentId, numberOfReplies, editVersion) <> ((Comment.apply _).tupled, Comment.unapply)
  }

}
