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

import java.time.{Instant, LocalDateTime}
import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.BlacklistedToken
import models.ResourceNotFoundException
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.Future

@Singleton
class BlacklistedTokenRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val BlacklistedTokens = TableQuery[BlacklistedTokensTable]

  def insert(token: BlacklistedToken): Future[BlacklistedToken] = {
    db.run {
      BlacklistedTokens returning BlacklistedTokens += token
    }
  }

  def findByToken(token: String) :Future[BlacklistedToken] = {
    db.run(BlacklistedTokens.filter(_.token === token).result.headOption)
      .map {
        case Some(token) => token
        case None => throw ResourceNotFoundException("token", token)
      }
  }

  final class BlacklistedTokensTable(tag: Tag) extends Table[BlacklistedToken](tag, Some("dataplane"), "blacklisted_tokens") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def token = column[String]("token")
    def expiry = column[LocalDateTime]("expiry")

    def * = (id, token, expiry) <> ((BlacklistedToken.apply _).tupled, BlacklistedToken.unapply)
  }

}
