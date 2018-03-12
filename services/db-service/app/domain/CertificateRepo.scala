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

import com.hortonworks.dataplane.commons.domain.Entities.{Certificate, Error, WrappedErrorException}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class CertificateRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider,
                                protected val userRepo: UserRepo) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Certificates = TableQuery[CertificatesTable]

  def list(active: Option[Boolean]): Future[List[Certificate]] = db.run {
    active match {
      case Some(active) => Certificates.filter(_.active === active).to[List].result
      case None => Certificates.to[List].result
    }
  }

  def create(certificate: Certificate): Future[Certificate] =
    db.run { Certificates returning Certificates += certificate }

  def retrieve(id: String): Future[Certificate] =
    db.run(Certificates.filter(_.id === id).result.headOption)
      .map{
        case Some(certificate) => certificate
        case None => throw WrappedErrorException(Error(404, "Unable to find certificate with supplied ID", "database.certificate.not-found"))
      }

  def update(certificate: Certificate): Future[Int] =
    db.run { Certificates.filter(_.id === certificate.id).update(certificate) }

  def delete(id: String): Future[Int] =
    db.run { Certificates.filter(_.id === id).delete }

  final class CertificatesTable(tag: Tag) extends Table[Certificate](tag, Some("dataplane"), "certificates") {
    def id = column[Option[String]]("id", O.PrimaryKey, O.AutoInc)

    def name = column[String]("name")

    def format = column[String]("format")

    def data = column[String]("data")

    def active = column[Boolean]("active")

    def * = (id, name, format, data, active) <> ((Certificate.apply _).tupled, Certificate.unapply)
  }

}
